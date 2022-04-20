from bs4 import BeautifulSoup
import requests
from time import sleep
import json
import re

# https://w2prod.sis.yorku.ca/Apps/WebObjects/cdm under "View Active Course Timetables" on the right sidebar
URLS = [
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/SU2021UG.html",
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/SU2021GS.html",
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/SU2021LW.html",
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/SU2021SB.html",
]

courses = []

pages = []
for url in URLS:
    pages.append(requests.get(url))

soups = []
for page in pages:
    soups.append(BeautifulSoup(page.content, 'html5lib'))

for i, soup in enumerate(soups):
    print(i)
    session_year = URLS[i].split("/")[-1].split(".")[0]
    session = session_year[:2]
    year = session_year[2:6]
    table = soup.find('tbody')
    rows = table.find_all(True, recursive=False)
    if len(rows) > 2:
        rows.pop(0)
        course = {}
        section = {}
        term = ""
        for row in rows:
            columns = row.find_all(True, recursive=False)
            if row.find(class_='bodytext'):
                course = {
                    "faculty": columns[0].get_text().strip(),
                    "subject": columns[1].get_text().strip(),
                    "name": columns[3].get_text().strip(),
                    "section": []
                }
                if not course in courses:
                    courses.append(course)
                term = columns[2].get_text().strip()
            elif len(columns[1].get_text().strip().split()) == 3:
                columns.pop(0)
                for br in columns[4].find_all("br"):
                    br.replace_with("\n")
                for br in columns[6].find_all("br"):
                    br.replace_with("\n")
                num_credit_sect = columns[0].get_text().strip().split()
                course["number"] = num_credit_sect[0]
                course["credits"] = num_credit_sect[1]
                course["language"] = columns[1].get_text().strip()
                section = {
                    "letter": num_credit_sect[2],
                    "term": term,
                    "session": session,
                    "year": year,
                    "director": "",
                    "offering": []
                }
                course["section"].append(section)
                notes = columns[7].get_text().strip()
                notes = notes.replace("Expanded Course Description", "")
                notes = notes.replace("Course Outline", "")
                offering = {
                    "type": columns[2].get_text().strip(),
                    "number": columns[3].get_text().strip(),
                    "instructor": [" ".join(str.strip().split()) for str in columns[6].get_text().strip().splitlines()],
                    "time": [],
                    "catalogueCode": [" ".join(str.strip().split()) for str in columns[4].get_text().strip().splitlines()],
                    "notes": notes
                }
                section["offering"].append(offering)
                time_rows = columns[5].find_all("tr")
                for time_row in time_rows:
                    time_details = time_row.find_all(True, recursive=False)
                    if time_details[0].get_text().strip().isalpha():
                        time = {
                            "day": time_details[0].get_text().strip(),
                            "startTime": time_details[1].get_text().strip(),
                            "duration": int(time_details[2].get_text().strip()),
                            "location": time_details[3].get_text().strip(),
                        }
                        offering["time"].append(time)
            else:
                columns.pop(0)
                for br in columns[4].find_all("br"):
                    br.replace_with("\n")
                for br in columns[2].find_all("br"):
                    br.replace_with("\n")
                notes = columns[5].get_text().strip()
                notes = notes.replace("Expanded Course Description", "")
                notes = notes.replace("Course Outline", "")
                offering = {
                    "type": columns[0].get_text().strip(),
                    "number": columns[1].get_text().strip(),
                    "instructor": [" ".join(str.strip().split()) for str in columns[4].get_text().strip().splitlines()],
                    "time": [],
                    "catalogueCode": [" ".join(str.strip().split()) for str in columns[2].get_text().strip().splitlines()],
                    "notes": notes
                }
                section["offering"].append(offering)
                time_rows = columns[3].find_all("tr")
                for time_row in time_rows:
                    time_details = time_row.find_all(True, recursive=False)
                    if time_details[0].get_text().strip().isalpha():
                        time = {
                            "day": time_details[0].get_text().strip(),
                            "startTime": time_details[1].get_text().strip(),
                            "duration": int(time_details[2].get_text().strip()),
                            "location": time_details[3].get_text().strip(),
                        }
                        offering["time"].append(time)

                # course = {
                #     "faculty": "LE",
                #     "subject": "EECS",
                #     "number": "1012",
                #     "name": "Introduction to Net-centric Computing",
                #     "credits": 3.00,
                #     "language": "English",
                #     "description": "",
                #     "prerequisite": [],
                #     "courseCreditExclusion": [],
                #     "leadsTo": [],
                #     "startSession": "",
                #     "endSession": "",
                #     "section": []
                # }

                # section = {
                #     "letter": "",
                #     "term": "",
                #     "director": "",
                #     "offering": []
                # }

                # offering = {
                #     "type": "LECT",
                #     "number": "01",
                #     "instructor": "name",
                #     "time": [],
                #     "catalogueCode": "AAAA",
                #     "notes": ""
                # }

                # time = {
                #     "day": "",
                #     "startTime": "",
                #     "duration": ""
                #     "location": "",
                # }

                # course = {
                #     "faculty": "LE",
                #     "subject": "EECS",
                #     "number": "1012",
                #     "name": "Introduction to Net-centric Computing",
                #     "credits": 3.00,
                #     "language": "English",
                #     "description": "",
                #     "prerequisite": [],
                #     "courseCreditExclusion": [],
                #     "leadsTo": [],
                #     "startSession": "",
                #     "endSession": "",
                #     "section": []
                # }

for course in list(courses):
    for section in list(course["section"]):
        for offering in list(section["offering"]):
            if "Cancelled" in offering["catalogueCode"] or "Backup" in offering["notes"]:
                section["offering"].remove(offering)
        if not section["offering"]: # or section["term"] == "F":
            course["section"].remove(section)
    if not course["section"]:
        courses.remove(course)
unique_courses = {}
for course in courses:
    if course['faculty'] + course['subject'] + course['number'] + course['credits'] not in unique_courses:
        unique_courses[course['faculty'] + course['subject'] + course['number'] + course['credits']] = {
            "faculty": course['faculty'],
            "subject": course['subject'],
            "number": course['number'],
            "credits": course['credits'],
            "name": course['name'],
            "sections": [f"{section['letter']}" for section in course["section"]]
        }
    else:
        unique_courses[course['faculty'] + course['subject'] + course['number'] + course['credits']]["sections"].extend([f"{section['letter']}" for section in course["section"]])
        unique_courses[course['faculty'] + course['subject'] + course['number'] + course['credits']]["sections"] = list(set(unique_courses[course['faculty'] + course['subject'] + course['number'] + course['credits']]["sections"]))
    
    unique_courses[course['faculty'] + course['subject'] + course['number'] + course['credits']]["sections"].sort()


# Removes all Fall courses
# for key, course in list(unique_courses.items()):
#     for section in list(course["sections"]):
#         if re.search("\(F\)$", section):
#             course["sections"].remove(section)
    
    # if not course["sections"]:
    #     unique_courses.pop(key)
        

f=open("courses.txt","w")
f.write(json.dumps(list(unique_courses.values())))
f.close()
print("finished")
