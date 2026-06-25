from __future__ import annotations

from pathlib import Path
import textwrap


OUT = Path("docs/popular-indian-remedies-research.pdf")
PAGE_W = 595
PAGE_H = 842
LEFT = 54
TOP = 790
BOTTOM = 54
LINE = 14


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class Pdf:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []
        self.current: list[str] = []
        self.y = TOP

    def new_page(self) -> None:
        if self.current:
            self.pages.append(self.current)
        self.current = []
        self.y = TOP

    def ensure(self, lines: int = 1) -> None:
        if self.y - lines * LINE < BOTTOM:
            self.new_page()

    def text(self, value: str, size: int = 10, x: int = LEFT, gap: int = LINE) -> None:
        self.ensure()
        self.current.append(
            f"BT /F1 {size} Tf {x} {self.y} Td ({pdf_escape(value)}) Tj ET"
        )
        self.y -= gap

    def para(self, value: str, size: int = 10, width: int = 88) -> None:
        for line in textwrap.wrap(value, width=width):
            self.text(line, size=size)
        self.y -= 4

    def heading(self, value: str) -> None:
        self.ensure(3)
        self.y -= 6
        self.text(value, size=15, gap=18)

    def subheading(self, value: str) -> None:
        self.ensure(3)
        self.text(value, size=12, gap=16)

    def build(self) -> bytes:
        if self.current:
            self.pages.append(self.current)

        objects: list[bytes] = []

        def add(obj: str | bytes) -> int:
            objects.append(obj.encode("latin-1") if isinstance(obj, str) else obj)
            return len(objects)

        catalog_id = add("<< /Type /Catalog /Pages 2 0 R >>")
        pages_id = add(b"")
        font_id = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        page_ids: list[int] = []
        content_ids: list[int] = []

        for lines in self.pages:
            stream = "\n".join(lines).encode("latin-1")
            content_ids.append(
                add(
                    b"<< /Length "
                    + str(len(stream)).encode("ascii")
                    + b" >>\nstream\n"
                    + stream
                    + b"\nendstream"
                )
            )
            page_ids.append(add(b""))

        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        objects[pages_id - 1] = (
            f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode(
                "latin-1"
            )
        )

        for i, page_id in enumerate(page_ids):
            objects[page_id - 1] = (
                f"<< /Type /Page /Parent {pages_id} 0 R "
                f"/MediaBox [0 0 {PAGE_W} {PAGE_H}] "
                f"/Resources << /Font << /F1 {font_id} 0 R >> >> "
                f"/Contents {content_ids[i]} 0 R >>"
            ).encode("latin-1")

        chunks = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
        offsets = [0]
        for idx, obj in enumerate(objects, start=1):
            offsets.append(sum(len(c) for c in chunks))
            chunks.append(f"{idx} 0 obj\n".encode("ascii"))
            chunks.append(obj)
            chunks.append(b"\nendobj\n")

        xref = sum(len(c) for c in chunks)
        chunks.append(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
        chunks.append(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            chunks.append(f"{offset:010d} 00000 n \n".encode("ascii"))
        chunks.append(
            (
                f"trailer << /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
                f"startxref\n{xref}\n%%EOF\n"
            ).encode("ascii")
        )
        return b"".join(chunks)


def main() -> None:
    pdf = Pdf()
    pdf.text("Popular Indian Home Remedies Research", size=20, gap=26)
    pdf.text("Additional remedies not already saved in the live database", size=12)
    pdf.text("Generated: 2026-06-24", size=10, gap=22)
    pdf.para(
        "Scope: This document excludes the five remedies already saved in the app "
        "database: Amla Juice, Ginger Honey Remedy, Neem Face Pack, Tulsi Ginger "
        "Tea, and Haldi Doodh. It lists additional remedies commonly used in "
        "Indian homes, with conservative usage notes and safety cautions."
    )
    pdf.para(
        "Note: Home remedies can support comfort for mild symptoms, but they do "
        "not replace diagnosis or medical treatment. Escalate persistent fever, "
        "breathing difficulty, severe pain, dehydration, blood in stool/vomit, "
        "pregnancy-related symptoms, infant symptoms, or symptoms lasting more "
        "than a few days."
    )

    remedies = [
        (
            "Ajwain Water",
            "Gas, bloating, heaviness after meals.",
            "Boil 1/2 tsp ajwain in 1 cup water for 3-5 minutes. Strain and sip warm after food.",
            "Avoid frequent use in pregnancy unless a clinician approves. Use small amounts for acidity-prone users.",
        ),
        (
            "Jeera-Dhania-Saunf Water",
            "Mild acidity, post-meal bloating, summer digestion support.",
            "Steep 1/2 tsp each cumin, coriander, and fennel seeds in hot water for 10 minutes; strain.",
            "Avoid replacing meals or fluids. People on diuretics or with kidney disease should keep intake moderate.",
        ),
        (
            "Salt-Water Gargle",
            "Sore throat comfort and throat irritation.",
            "Dissolve 1/4 to 1/2 tsp salt in a cup of warm water. Gargle and spit out 2-3 times daily.",
            "Do not swallow repeatedly. Avoid for young children who cannot gargle safely.",
        ),
        (
            "Steam Inhalation",
            "Nasal congestion and stuffy nose comfort.",
            "Use plain steam for 5-10 minutes, keeping the face away from hot water to prevent burns.",
            "Avoid essential oils for infants, asthma-prone users, and anyone irritated by strong vapors.",
        ),
        (
            "Pudina Tea",
            "Mild indigestion, gas, and cooling comfort.",
            "Steep fresh mint leaves in hot water for 5 minutes. Sip warm after meals.",
            "Peppermint can worsen reflux in some people. Avoid concentrated peppermint oil without medical guidance.",
        ),
        (
            "Aloe Vera Gel",
            "Minor skin dryness, mild sun exposure, and non-broken skin soothing.",
            "Apply a thin layer of clean aloe gel to intact skin. Patch test first.",
            "Do not apply to deep wounds, severe burns, or infected skin. Stop if rash or itching appears.",
        ),
        (
            "Triphala Night Drink",
            "Occasional constipation support.",
            "Use a small dose of triphala powder in warm water at night, following product directions.",
            "Avoid during pregnancy, diarrhea, dehydration, and with laxative overuse. Check interactions if on medication.",
        ),
        (
            "Methi Seed Water",
            "Traditional metabolic and digestion support.",
            "Soak 1 tsp fenugreek seeds overnight in water. Drink the strained water in the morning.",
            "May affect blood sugar. People on diabetes medicines, pregnant users, or surgery patients should ask a clinician.",
        ),
        (
            "Rice Kanji",
            "Light food during mild stomach upset or low appetite.",
            "Cook rice with extra water until soft. Serve the starchy liquid with a pinch of salt if tolerated.",
            "Seek care for dehydration, high fever, persistent vomiting, or diarrhea in children and older adults.",
        ),
        (
            "Coconut Oil Scalp Massage",
            "Dry scalp and hair conditioning.",
            "Massage a small amount into scalp/hair, leave 30-60 minutes, then wash.",
            "Avoid if it worsens dandruff, acne, or scalp itching. Patch test for sensitive skin.",
        ),
    ]

    pdf.heading("Remedies")
    for title, use, prep, caution in remedies:
        pdf.subheading(title)
        pdf.para(f"Common use: {use}")
        pdf.para(f"How used: {prep}")
        pdf.para(f"Caution: {caution}")

    pdf.heading("Research Notes")
    notes = [
        "NCCIH notes that ginger has been studied for nausea and digestive symptoms, but evidence and product quality vary.",
        "NCCIH notes turmeric/curcumin research is active, but supplement dosing and interactions require caution.",
        "NCCIH notes peppermint oil may help some IBS symptoms, while peppermint can worsen reflux for some users.",
        "Cochrane's review on honey for acute cough in children is relevant to cough remedies, but honey must not be given to children under 1 year.",
        "Traditional Indian household use is not the same as proven clinical efficacy. The remedies above are framed as comfort/support practices for mild symptoms.",
    ]
    for note in notes:
        pdf.para(f"- {note}")

    pdf.heading("Sources")
    sources = [
        "NCCIH. Ginger: Usefulness and Safety. https://www.nccih.nih.gov/health/ginger",
        "NCCIH. Turmeric: Usefulness and Safety. https://www.nccih.nih.gov/health/turmeric",
        "NCCIH. Peppermint Oil: Usefulness and Safety. https://www.nccih.nih.gov/health/peppermint-oil",
        "Cochrane. Honey for acute cough in children. https://www.cochrane.org/evidence/CD007094_honey-acute-cough-children",
    ]
    for source in sources:
        pdf.para(source)

    OUT.write_bytes(pdf.build())
    print(OUT)


if __name__ == "__main__":
    main()
