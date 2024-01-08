import json
import os
from typing import List

from parser import CourseScheduleParser

doc_paths: List[str] = os.listdir("./schedules")
all_data: dict = dict()
final_results: List[dict] = []

for idx, doc_path in enumerate(doc_paths):
    print(f"Parsing document {idx + 1} / {len(doc_paths)}.")

    data: str = open(f"./schedules/{doc_path}", "r", encoding="utf-16").read()
    _parser: CourseScheduleParser = CourseScheduleParser(data)

    all_data = {**_parser.parse(), **all_data}


print("Post-processing data to fit Study Buddies")

for key, value in all_data.items():
    split = key.split("-")
    num = split[2]
    credit = split[3]
    sections = list(value.get('sections').keys())

    final_results.append(
        {
            "faculty": value.get("faculty"),
            "subject": value.get("subject"),
            "number": num,
            "credits": credit,
            "name": value.get('title'),
            "sections": sections
        }
    )

print("Outputting to file")
with open("./output/output.js", "w", encoding="utf-8") as file:
    data = json.dumps(final_results)
    file.write("module.exports = " + data)
