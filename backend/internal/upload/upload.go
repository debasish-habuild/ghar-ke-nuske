// Package upload proxies image uploads to the company file-service + S3.
//
// The dashboard sends the raw file to this auth-protected endpoint; the backend
// asks the file-service for a pre-signed S3 URL (adding the server-side token)
// and PUTs the bytes to S3 itself. Two reasons it works this way:
//   - the file-service bearer token never reaches the browser bundle, and
//   - the bytes go server→S3, so there is no browser→S3 request and therefore
//     no S3-bucket CORS to configure.
package upload

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// bucket is the fixed S3 bucket all Ghar Ke Nuskhe image assets live in.
const bucket = "ghar-ke-nuske-image-assets"

// maxUpload caps the accepted file size (images only).
const maxUpload = 15 << 20 // 15 MiB

var nonAlnumDot = regexp.MustCompile(`[^a-z0-9.]+`)

// Handler uploads images via the file-service.
type Handler struct {
	baseURL string
	token   string
	client  *http.Client
}

// New builds a Handler. baseURL is the file-service base; token is its bearer
// token (may be empty, in which case uploads are disabled and return 503).
func New(baseURL, token string) *Handler {
	return &Handler{
		baseURL: strings.TrimRight(baseURL, "/"),
		token:   token,
		client:  &http.Client{Timeout: 30 * time.Second},
	}
}

// Upload handles POST /api/upload (multipart/form-data: "file" + "folder").
// Registered behind the same Basic-Auth middleware as the other mutations.
func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	if h.token == "" {
		writeError(w, http.StatusServiceUnavailable,
			"image upload is not configured (FILE_SERVICE_TOKEN unset)", nil)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUpload)
	if err := r.ParseMultipartForm(maxUpload); err != nil {
		writeError(w, http.StatusBadRequest, "could not read upload (max 15MB)", err)
		return
	}

	folder := strings.Trim(r.FormValue("folder"), "/ ")
	if folder == "" {
		folder = "uploads"
	}

	file, hdr, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing 'file' field", err)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusBadRequest, "failed to read uploaded file", err)
		return
	}

	contentType := hdr.Header.Get("Content-Type")
	if contentType == "" {
		contentType = http.DetectContentType(data)
	}
	fileName := safeFileName(hdr.Filename)

	// 1. Ask the file-service for a pre-signed PUT URL (token added here).
	uploadURL, publicURL, err := h.signURL(r.Context(), folder, fileName, contentType)
	if err != nil {
		writeError(w, http.StatusBadGateway, "could not get an upload URL", err)
		return
	}

	// 2. PUT the bytes to S3 ourselves (server→S3; no browser CORS involved).
	putReq, err := http.NewRequestWithContext(r.Context(), http.MethodPut, uploadURL, bytes.NewReader(data))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to build S3 request", err)
		return
	}
	putReq.Header.Set("Content-Type", contentType)
	putReq.ContentLength = int64(len(data))

	putRes, err := h.client.Do(putReq)
	if err != nil {
		writeError(w, http.StatusBadGateway, "failed to upload to storage", err)
		return
	}
	defer putRes.Body.Close()
	if putRes.StatusCode/100 != 2 {
		raw, _ := io.ReadAll(io.LimitReader(putRes.Body, 512))
		snippet := strings.TrimSpace(string(raw))
		writeError(w, http.StatusBadGateway,
			fmt.Sprintf("storage rejected the upload (%d): %s", putRes.StatusCode, snippet), nil)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"publicUrl": publicURL})
}

// fileServiceRequest mirrors the file-service's SignedUrlRequestDto.
type fileServiceRequest struct {
	BucketName  string `json:"bucketName"`
	FolderName  string `json:"folderName"`
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
	IsPublicURL bool   `json:"isPublicUrl"`
	ExpiresIn   int    `json:"expiresIn"`
}

// signURL calls the file-service and returns the pre-signed PUT URL plus the
// canonical public URL (the pre-signed URL minus its query string).
func (h *Handler) signURL(ctx context.Context, folder, fileName, contentType string) (string, string, error) {
	// IsPublicURL:false → do NOT sign with an x-amz-acl:public-read header.
	// The bucket has Object Ownership = "Bucket owner enforced" (ACLs disabled),
	// so any PUT carrying an ACL header is rejected by S3 with 400
	// AccessControlListNotSupported. Public read is granted via a bucket policy
	// on the prefix instead, not per-object ACLs.
	body, _ := json.Marshal(fileServiceRequest{
		BucketName:  bucket,
		FolderName:  folder,
		FileName:    fileName,
		ContentType: contentType,
		IsPublicURL: false,
		ExpiresIn:   3600,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		h.baseURL+"/api/v1/file/upload-url", bytes.NewReader(body))
	if err != nil {
		return "", "", err
	}
	req.Header.Set("Authorization", "Bearer "+h.token)
	req.Header.Set("Content-Type", "application/json")

	res, err := h.client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusCreated {
		snippet, _ := io.ReadAll(io.LimitReader(res.Body, 512))
		return "", "", fmt.Errorf("file-service %d: %s", res.StatusCode, strings.TrimSpace(string(snippet)))
	}

	var fsRes struct {
		UploadURL string `json:"uploadUrl"`
	}
	if err := json.NewDecoder(res.Body).Decode(&fsRes); err != nil || fsRes.UploadURL == "" {
		return "", "", fmt.Errorf("file-service returned no uploadUrl")
	}

	publicURL := fsRes.UploadURL
	if i := strings.IndexByte(publicURL, '?'); i >= 0 {
		publicURL = publicURL[:i]
	}
	return fsRes.UploadURL, publicURL, nil
}

// safeFileName builds a unique, S3-safe object name from the original name.
func safeFileName(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	s = nonAlnumDot.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		s = "image"
	}
	return fmt.Sprintf("%d-%s", time.Now().UnixNano(), s)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode upload response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string, cause error) {
	if cause != nil {
		log.Printf("%s: %v", msg, cause)
	}
	writeJSON(w, status, map[string]string{"error": msg})
}
