import json
import os
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
REQUIRED_Q = ["id", "number", "type", "prompt", "choices", "correctChoiceId", "explanation"]
REQUIRED_META = ["subtestId", "subtestName", "part", "source", "version", "lastUpdated"]
CHOICE_IDS = ["A", "B", "C", "D", "E"]
IR_CATS = ["figural_series", "figure_grouping", "number_series", "letter_series"]
IR_MIXED = "number_letter_series"
PA_CATS = ["hidden_figure", "mirror_image", "identical_information"]

subjects = json.load(open(os.path.join(ROOT, "data/subjects.json"), encoding="utf-8"))
images_dir = os.path.join(ROOT, "assets/images")
image_files = set(os.listdir(images_dir))

report = {
    "files": {},
    "globalDuplicateIds": {},
    "missingImages": [],
    "orphanImages": [],
    "subjectsMismatch": [],
    "irTypeIssues": [],
    "paTypeIssues": [],
    "irCategoryCounts": {},
    "paCategoryCounts": {},
    "allReferencedImages": set(),
    "structureFieldPresence": {},
}

all_ids = defaultdict(list)


def check_question(q, rel_path, file_report):
    qid = q.get("id", "UNKNOWN")
    for field in REQUIRED_Q:
        if field not in q or q[field] is None or q[field] == "":
            if not (field == "prompt" and q.get(field) == ""):
                file_report["questionIssues"].append(f"{qid}: missing {field}")
    if q.get("id"):
        file_report["ids"].append(q["id"])
        all_ids[q["id"]].append(rel_path)
    if isinstance(q.get("number"), int):
        file_report["numbers"].append(q["number"])
    if q.get("type"):
        file_report["types"][q["type"]] = file_report["types"].get(q["type"], 0) + 1
    if q.get("image"):
        file_report["images"].append({"id": qid, "image": q["image"]})
        report["allReferencedImages"].add(q["image"])
        fname = os.path.basename(q["image"])
        if fname not in image_files:
            report["missingImages"].append(
                {"file": rel_path, "questionId": qid, "image": q["image"]}
            )
    choices = q.get("choices")
    if isinstance(choices, list):
        count = len(choices)
        if count < 4 or count > 5:
            file_report["choiceIssues"].append(f"{qid}: {count} choices (expected 4-5)")
        cids = [c.get("id") for c in choices]
        for choice in choices:
            if not choice.get("id") or choice.get("text") is None:
                file_report["choiceIssues"].append(f"{qid}: choice missing id/text")
        if q.get("correctChoiceId") and q["correctChoiceId"] not in cids:
            file_report["choiceIssues"].append(
                f"{qid}: correctChoiceId '{q['correctChoiceId']}' not in choices"
            )
        expected = CHOICE_IDS[:count]
        for i, cid in enumerate(cids):
            if cid != expected[i]:
                file_report["choiceIssues"].append(
                    f"{qid}: choice id at index {i} is {cid}, expected {expected[i]}"
                )


for subtest in subjects["subtests"]:
    rel_path = subtest["questionFile"]
    q_path = os.path.join(ROOT, rel_path.replace("/", os.sep))
    data = json.load(open(q_path, encoding="utf-8"))
    fr = {
        "path": rel_path,
        "subtestId": subtest["id"],
        "questionCount": 0,
        "targetItemCount": subtest["targetItemCount"],
        "metaIssues": [],
        "questionIssues": [],
        "types": {},
        "numbers": [],
        "ids": [],
        "images": [],
        "choiceIssues": [],
        "duplicateIdsInFile": [],
        "duplicateNumbers": [],
        "numbersSequential": True,
        "numberGaps": [],
        "unknownCategoryTypes": [],
        "missingCategoryTypes": [],
        "metaSubtestIdMismatch": None,
        "fieldKeys": set(),
    }
    meta = data.get("meta")
    if not meta:
        fr["metaIssues"].append("missing meta object")
    else:
        for field in REQUIRED_META:
            if field not in meta:
                fr["metaIssues"].append(f"meta missing: {field}")
        if meta.get("subtestId") != subtest["id"]:
            fr["metaSubtestIdMismatch"] = (
                f"meta.subtestId '{meta.get('subtestId')}' != '{subtest['id']}'"
            )
    qs = data.get("questions")
    if not isinstance(qs, list):
        fr["questionIssues"].append("questions is not an array")
    else:
        fr["questionCount"] = len(qs)
        id_set = set()
        num_counts = defaultdict(int)
        for q in qs:
            check_question(q, rel_path, fr)
            for key in q.keys():
                fr["fieldKeys"].add(key)
            qid = q.get("id")
            if qid in id_set:
                fr["duplicateIdsInFile"].append(qid)
            id_set.add(qid)
            if isinstance(q.get("number"), int):
                num_counts[q["number"]] += 1
        fr["duplicateNumbers"] = [n for n, c in num_counts.items() if c > 1]
        sorted_nums = sorted(fr["numbers"])
        expected = list(range(1, len(sorted_nums) + 1))
        fr["numbersSequential"] = sorted_nums == expected
        fr["numberGaps"] = [n for n in expected if n not in sorted_nums]
        if fr["questionCount"] != subtest["targetItemCount"]:
            report["subjectsMismatch"].append(
                {
                    "subtest": subtest["id"],
                    "target": subtest["targetItemCount"],
                    "actual": fr["questionCount"],
                    "diff": fr["questionCount"] - subtest["targetItemCount"],
                }
            )
        if subtest.get("questionOrder"):
            cats = subtest["questionOrder"]["categories"]
            fr["unknownCategoryTypes"] = [
                t for t in fr["types"] if t not in cats and t != IR_MIXED
            ]
            fr["missingCategoryTypes"] = [c for c in cats if c not in fr["types"]]
            if subtest["id"] == "inductive-reasoning":
                tag_counts = defaultdict(int)
                for q in qs:
                    if q.get("type") == IR_MIXED:
                        for tag in q.get("tags") or []:
                            if tag in cats:
                                tag_counts[tag] += 1
                fr["tagSuppliedCategories"] = dict(tag_counts)
    report["files"][subtest["id"]] = {
        key: (sorted(value) if isinstance(value, set) else value) for key, value in fr.items()
    }
    report["structureFieldPresence"][subtest["id"]] = sorted(fr["fieldKeys"])

report["globalDuplicateIds"] = {k: v for k, v in all_ids.items() if len(v) > 1}

ir_path = os.path.join(ROOT, "data/questions/inductive-reasoning.json")
ir_data = json.load(open(ir_path, encoding="utf-8"))
report["irCategoryCounts"] = {c: 0 for c in IR_CATS}
report["irCategoryCounts"][IR_MIXED] = 0
for q in ir_data["questions"]:
    qtype = q.get("type")
    tags = q.get("tags") or []
    if qtype not in IR_CATS + [IR_MIXED]:
        report["irTypeIssues"].append({"id": q["id"], "type": qtype, "issue": "invalid type"})
    if qtype == IR_MIXED:
        has_num = "number_series" in tags
        has_let = "letter_series" in tags
        if not has_num and not has_let:
            report["irTypeIssues"].append(
                {"id": q["id"], "type": qtype, "issue": "number_letter_series missing tag"}
            )
        if has_num and has_let:
            report["irTypeIssues"].append(
                {"id": q["id"], "type": qtype, "issue": "both number and letter tags"}
            )
        if has_num:
            report["irCategoryCounts"]["number_series"] += 1
        if has_let:
            report["irCategoryCounts"]["letter_series"] += 1
        report["irCategoryCounts"][IR_MIXED] += 1
    elif qtype in IR_CATS:
        report["irCategoryCounts"][qtype] += 1
        cat_tags = [x for x in tags if x in IR_CATS]
        if cat_tags and qtype not in tags:
            report["irTypeIssues"].append(
                {
                    "id": q["id"],
                    "type": qtype,
                    "tags": tags,
                    "issue": "category tag does not include type",
                }
            )

pa_path = os.path.join(ROOT, "data/questions/perceptual-acuity.json")
pa_data = json.load(open(pa_path, encoding="utf-8"))
report["paCategoryCounts"] = {c: 0 for c in PA_CATS}
for q in pa_data["questions"]:
    qtype = q.get("type")
    tags = q.get("tags") or []
    if qtype not in PA_CATS:
        report["paTypeIssues"].append({"id": q["id"], "type": qtype, "issue": "invalid type"})
    elif qtype in PA_CATS:
        report["paCategoryCounts"][qtype] += 1
        cat_tags = [x for x in tags if x in PA_CATS]
        if cat_tags and qtype not in tags:
            report["paTypeIssues"].append(
                {
                    "id": q["id"],
                    "type": qtype,
                    "tags": tags,
                    "issue": "category tag does not include type",
                }
            )

for fname in sorted(image_files):
    if fname == "icon.svg":
        continue
    if not any(
        os.path.basename(ref) == fname or ref.endswith(fname)
        for ref in report["allReferencedImages"]
    ):
        report["orphanImages"].append(fname)

union = set()
for keys in report["structureFieldPresence"].values():
    union.update(keys)
report["keyUnion"] = sorted(union)
report["keyMissingByFile"] = {
    sid: sorted(union - set(keys)) for sid, keys in report["structureFieldPresence"].items()
}

report["allReferencedImages"] = sorted(report["allReferencedImages"])
report["imageRefCount"] = len(report["allReferencedImages"])
report["imageFileCount"] = len(image_files)
report["orphanImageCount"] = len(report["orphanImages"])
report["missingImageCount"] = len(report["missingImages"])

print(json.dumps(report, indent=2))
