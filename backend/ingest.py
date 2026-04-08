import chromadb
from openai import OpenAI
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma_client = chromadb.PersistentClient(path="./chroma_db")

COLLECTION_NAME = "mamacord_who_guidelines"

WHO_CHUNKS = [
    {
        "text": "WHO recommendation: For women with severe hypertension (systolic BP ≥160 mmHg or diastolic BP ≥110 mmHg) during pregnancy, antihypertensive drug treatment is recommended to lower the risk of severe maternal morbidity. Hydralazine, labetalol, and oral nifedipine are recommended first-line agents.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Hypertensive Disorders §4.1",
        "page": "42"
    },
    {
        "text": "WHO recommendation: Eclampsia is defined as new-onset grand mal seizures in a woman with pre-eclampsia. Magnesium sulphate is the recommended anticonvulsant of choice for prevention and treatment of eclampsia. Loading dose: 4g IV over 5–10 minutes, followed by 1g/hour infusion.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Eclampsia Management §4.3",
        "page": "47"
    },
    {
        "text": "Pre-eclampsia is diagnosed when a woman has hypertension (≥140/90 mmHg) after 20 weeks of gestation accompanied by proteinuria (≥1+ on dipstick or ≥300mg/24h). Severe pre-eclampsia is defined by BP ≥160/110 mmHg with proteinuria, or hypertension with signs of end-organ damage including thrombocytopaenia, renal insufficiency, liver dysfunction, pulmonary oedema, or new-onset headache.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Pre-eclampsia Diagnosis §4.2",
        "page": "44"
    },
    {
        "text": "WHO recommendation: Active management of the third stage of labour (AMTSL) is recommended for all births to reduce the incidence of postpartum haemorrhage (PPH). AMTSL includes: administration of oxytocin 10 IU IM/IV, controlled cord traction, and uterine massage after placenta delivery. PPH is defined as blood loss ≥500mL after vaginal delivery or ≥1000mL after caesarean.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Postpartum Haemorrhage Prevention §6.1",
        "page": "72"
    },
    {
        "text": "Postpartum haemorrhage (PPH) management: First-line treatment is oxytocin. If bleeding continues, use ergometrine, carboprost, or tranexamic acid. For atonic PPH: bimanual uterine compression, aortic compression, intrauterine balloon tamponade. Blood transfusion should be initiated if haemoglobin falls below 7 g/dL or haematocrit below 21% with signs of haemodynamic instability.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "PPH Treatment §6.2",
        "page": "75"
    },
    {
        "text": "Maternal sepsis is a life-threatening condition defined as organ dysfunction resulting from infection during pregnancy, childbirth, post-abortion, or the postpartum period. Diagnostic criteria include: temperature >38°C or <36°C, heart rate >100 bpm, respiratory rate >20/min, suspected or confirmed infection. Early administration of broad-spectrum antibiotics within 1 hour of diagnosis is essential.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Maternal Sepsis §7.1",
        "page": "88"
    },
    {
        "text": "WHO recommendation on anaemia in pregnancy: Haemoglobin <11 g/dL in the first and third trimesters and <10.5 g/dL in the second trimester is considered anaemia. Severe anaemia (Hb <7 g/dL) requires urgent evaluation and treatment. Moderate anaemia (Hb 7–9 g/dL) requires iron supplementation and close monitoring. Blood transfusion is indicated for Hb <7 g/dL with symptoms of cardiac decompensation.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Anaemia in Pregnancy §5.1",
        "page": "60"
    },
    {
        "text": "Placenta praevia is defined as a placenta that overlies or is proximate to the internal cervical os. Major praevia (complete or partial) is associated with painless antepartum haemorrhage and requires immediate hospital admission, avoidance of vaginal examination, and planned caesarean delivery. Emergency caesarean is required for active haemorrhage with placenta praevia.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Placenta Praevia §6.4",
        "page": "80"
    },
    {
        "text": "Danger signs in pregnancy requiring immediate referral: severe headache, visual disturbances (blurred vision, photophobia), epigastric pain, rapid weight gain with oedema, reduced fetal movements, vaginal bleeding at any gestation, signs of preterm labour before 37 weeks, temperature >38°C with rigors. All danger signs warrant immediate escalation to a facility with emergency obstetric care capacity.",
        "source": "WHO Recommendations: Antenatal Care",
        "section": "Danger Signs §2.3",
        "page": "28"
    },
    {
        "text": "Oligohydramnios (AFI <5cm or single deepest pocket <2cm) is associated with fetal growth restriction, post-term pregnancy, and uteroplacental insufficiency. It is a RED flag finding requiring urgent obstetric review. Fetal heart rate abnormalities (FHR <110 or >160 bpm) require immediate assessment for fetal compromise.",
        "source": "WHO Recommendations: Antenatal Care",
        "section": "Fetal Wellbeing §3.2",
        "page": "35"
    },
    {
        "text": "Breech presentation at term (≥36 weeks) is associated with increased risk of cord prolapse, birth asphyxia, and birth trauma. External cephalic version (ECV) may be offered if no contraindications. Planned caesarean section is recommended for persistent breech at term in settings where skilled birth attendants for vaginal breech delivery are not available.",
        "source": "WHO Recommendations: Intrapartum Care",
        "section": "Malpresentation §8.2",
        "page": "102"
    },
    {
        "text": "Septic shock in obstetric patients: Signs include hypotension (systolic BP <90 mmHg), heart rate >100 bpm, altered mental status, temperature >38.5°C or <36°C, elevated lactate. Management requires immediate IV access, fluid resuscitation with crystalloids (30mL/kg), blood cultures before antibiotics, and broad-spectrum antibiotics including coverage for Group A Streptococcus and Gram-negative organisms.",
        "source": "WHO Guidelines for Maternal Health",
        "section": "Septic Shock §7.3",
        "page": "93"
    }
]


def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return [item.embedding for item in response.data]


def ingest():
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    existing = collection.count()
    if existing > 0:
        print(f"Collection already contains {existing} chunks. Skipping ingest.")
        print("To re-ingest, delete the ./chroma_db directory and re-run.")
        return

    texts = [chunk["text"] for chunk in WHO_CHUNKS]
    print(f"Embedding {len(texts)} chunks...")
    embeddings = embed_texts(texts)

    ids = [str(uuid.uuid4()) for _ in WHO_CHUNKS]
    metadatas = [
        {"source": c["source"], "section": c["section"], "page": c["page"]}
        for c in WHO_CHUNKS
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )

    print(f"\nSuccessfully ingested {len(WHO_CHUNKS)} WHO guideline chunks into ChromaDB.")
    print(f"Collection: '{COLLECTION_NAME}' | Path: ./chroma_db")
    for i, chunk in enumerate(WHO_CHUNKS):
        print(f"  [{i+1}] {chunk['section']}")


if __name__ == "__main__":
    ingest()
