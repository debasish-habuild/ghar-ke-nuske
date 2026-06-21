// Package catalog models the read-only content catalog stored in Firestore:
// remedies, the categories and ingredients they reference, and app-wide config.
//
// The struct field tags mirror the EXACT field names of the documents that
// already live in the `ghar-ke-nuske-dev` Firestore (a normalised schema:
// remedies reference categories and ingredients by id). The data is the source
// of truth — these structs describe it, they do not redefine it.
package catalog

import "time"

// RemedyIngredient is one entry in a remedy's ingredient list. It references an
// ingredient document by id and carries the amount specific to this remedy.
type RemedyIngredient struct {
	IngredientID string `firestore:"ingredientId" json:"ingredientId"`
	Amount       string `firestore:"amount"       json:"amount"`
}

// Remedy is a single home remedy document from the `remedies` collection.
type Remedy struct {
	ID                string             `firestore:"-"                 json:"id"`
	Title             string             `firestore:"title"             json:"title"`
	Summary           string             `firestore:"summary"           json:"summary"`
	ImageURL          string             `firestore:"imageUrl"          json:"imageUrl"`
	Time              string             `firestore:"time"              json:"time"`
	PrimaryCategoryID string             `firestore:"primaryCategoryId" json:"primaryCategoryId"`
	CategoryIDs       []string           `firestore:"categoryIds"       json:"categoryIds"`
	IngredientIDs     []string           `firestore:"ingredientIds"     json:"ingredientIds"`
	Ingredients       []RemedyIngredient `firestore:"ingredients"       json:"ingredients"`
	Steps             []string           `firestore:"steps"             json:"steps"`
	Benefits          []string           `firestore:"benefits"          json:"benefits"`
	Precautions       []string           `firestore:"precautions"       json:"precautions"`
	IsPopular         bool               `firestore:"isPopular"         json:"isPopular"`
	CreatedAt         time.Time          `firestore:"createdAt"         json:"createdAt"`
	UpdatedAt         time.Time          `firestore:"updatedAt"         json:"updatedAt"`
}

// Category is a grouping/tag from the `categories` collection. `roles` marks
// how a category is used (e.g. "symptom").
type Category struct {
	ID    string   `firestore:"-"     json:"id"`
	Name  string   `firestore:"name"  json:"name"`
	Emoji string   `firestore:"emoji" json:"emoji"`
	Order int      `firestore:"order" json:"order"`
	Roles []string `firestore:"roles" json:"roles"`
}

// Ingredient is a single ingredient from the `ingredients` collection. `group`
// buckets ingredients in the picker UI (e.g. "Common Herbs").
type Ingredient struct {
	ID    string `firestore:"-"     json:"id"`
	Name  string `firestore:"name"  json:"name"`
	Emoji string `firestore:"emoji" json:"emoji"`
	Group string `firestore:"group" json:"group"`
	Order int    `firestore:"order" json:"order"`
}

// AppConfig is the `config/app` document driving dynamic UI bits: the rotating
// search placeholders and the id of the remedy featured as "today's recipe".
type AppConfig struct {
	SearchPlaceholders []string `firestore:"searchPlaceholders" json:"searchPlaceholders"`
	TodaysRecipeID     string   `firestore:"todaysRecipeId"     json:"todaysRecipeId"`
}
