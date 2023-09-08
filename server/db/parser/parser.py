import re
from typing import List, Optional, Tuple, Union, Dict, Any

import bs4
from bs4.element import Tag


_multi_space = re.compile("([  ])+")
_multi_underscore = re.compile("_+")
_char_cleaned = re.compile("[^a-zA-Z0-9 _:\-.]")
_alpha_num = re.compile(r'\W+')
_session_edit = re.compile('(?<=/wo/)(.*)(?=/)')
_subject_faculty = re.compile('(?<=\( )(.*)(?= \))')
_nbsp = re.compile(" +")


def clean(string: str):
    char_cleaned = _char_cleaned.sub("", str(string))
    return re.sub(" +", " ", char_cleaned).strip()


def recursive_scrub(data: Union[dict, list]) -> Union[dict, list]:
    for key, value in (data.items() if isinstance(data, dict) else enumerate(data)):
        if isinstance(value, dict) or isinstance(value, list):
            data[key] = recursive_scrub(value)
            continue

        # Clean Values, YorkU's site formatting is truly nasty
        data[key] = clean(value)

    return data


def sanitize_name(string: str) -> str:
    no_space = string.lower().replace(" ", "_").replace("-", "_").replace("/", "_")
    alphanum = _alpha_num.sub("", no_space)
    one_underscore = _multi_underscore.sub("_", alphanum)
    return one_underscore.strip("_")


def parse_course_index(html: str) -> Optional[dict]:
    try:
        soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")
        tag: bs4.element.Tag = soup.find("img", {"alt": "York Courses Web Site"})
        parent: Tag = tag.find_parent("table")
        rows: List[Tag] = parent.find_all("td")
        rows: List[Tag] = rows[1: len(rows) - 1]  # Remove Title, End spacer
        rows: List[Tag] = [row for row in rows if row.find("img") or row.find("a")]  # Remove Invalids
        categories: dict = dict()
        cursor: Optional[str] = None

        for row in rows:
            img, a = row.find("img"), row.find("a")

            # Set next category
            if not a:
                cursor = sanitize_name(img.attrs.get("alt"))
                categories[cursor] = dict()
                continue

            name: str = sanitize_name(img.attrs.get("alt"))
            url_path = a.attrs.get("href")
            categories[cursor][name] = config.YORKU_COURSES_BASE_URL + url_path[1:] if url_path.startswith("/") else url_path

        return categories if categories else None
    except:
        return None


def parse_building_codes(html: str) -> Optional[dict]:
    try:
        soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

        table = soup.find("table", attrs={"summary": "The table is used to list Acronyms used for Names of Buildings at York University"})
        trs = table.find_all("tr")

        data: dict = dict()

        for tr in trs:
            tds = tr.find_all("td")
            data[clean(tds[0].text)] = tds[1].text.strip()

        # Hardcode Certain Buildings
        data["R"] = "Ross Building";
        data["ACW"] = "Accolade West";
        data["ACE"] = "Accolade East";
        data["HNE"] = "Health Nursing and Environmental Studies";

        return data
    except:
        return None


def parse_course_urls(html: str) -> Optional[dict]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

    tag: bs4.element.Tag = soup.find("th", text="Course")
    parent: Tag = tag.find_parent("table")
    rows = parent.find_all("tr")
    courses: dict = dict()

    for course in rows[1:]:
        data: List[Tag] = course.find_all("td")

        code = clean(data[0].text.replace("/", "-")).replace(" ", "-")
        title = data[1].text.strip()

        faculty, subject, number, credit = code.split("-")

        if not courses.get(faculty):
            courses[faculty] = dict()

        if not courses[faculty].get(subject):
            courses[faculty][subject] = list()

        courses[faculty][subject].append({
            "course": code,
            "code": subject,
            "number": number,
            "credit": credit,
            "title": title
        })

    return recursive_scrub(courses)


def parse_course_list(html: str) -> Optional[dict]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

    if "No courses were found" in html:
        return None

    tag: bs4.element.Tag = soup.find("th", text="Course")
    parent: Tag = tag.find_parent("table")
    rows = parent.find_all("tr")
    courses: dict = dict()

    for course in rows[1:]:
        data: List[Tag] = course.find_all("td")
        code = clean(data[0].text.replace("/", "-")).replace(" ", "-")
        title = data[1].text.strip()

        faculty, subject, number, credit = code.split("-")

        if not courses.get(faculty):
            courses[faculty] = dict()

        if not courses[faculty].get(subject):
            courses[faculty][subject] = list()

        courses[faculty][subject].append({
            "course": code,
            "code": subject,
            "number": number,
            "credit": credit,
            "title": title
        })

    return recursive_scrub(courses)


def parse_cdm_home_session_id(html: str) -> str:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")
    url = soup.find("a", text="Subject").attrs["href"]
    return _session_edit.findall(url)[0]


def get_multi_option(soup: bs4.BeautifulSoup) -> Optional[str]:
    # Check if valid
    course: Optional[Tag] = soup.find("th", text="Course")
    if not course:
        return None

    # Find parent table
    table: Optional[Tag] = course.find_parent("table")
    if not table:
        return None

    # Look for course links
    links: List[Tag] = table.find_all("a")
    if not links:
        return None

    # Check for descriptions
    for link in links:
        if "Schedule" in link.text:
            return link.attrs.get("href")

    return None


def parse_course_desc(soup: bs4.BeautifulSoup) -> Optional[str]:
    try:
        desc_title_p = soup.find("strong", text="Course Description:")
        desc = desc_title_p.find_next("p").text
        return desc
    except:
        return None


def not_offered_this_year(soup: bs4.BeautifulSoup) -> bool:
    return bool(soup.find("a", text="Historical Courses Search"))


def invalid_course(soup: bs4.BeautifulSoup) -> bool:
    return bool(soup.find("b", text="This query cannot be finished because of incorrect/insufficient parameters."))


def parse_course_info(html: str) -> dict:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

    # Course Description
    desc_title_p: Tag = soup.find("p", attrs={"class": "bold"}, text="Course Description:")
    desc: str = desc_title_p.find_next("p").text

    # Course Language
    lang_title_p: Tag = soup.find("p", attrs={"class": "bold"}, text="Language of Instruction:")
    lang: str = lang_title_p.find_next("p").text

    # Get all Section tables
    section_container_table = lang_title_p.find_next_sibling("table")
    sections_trs = [section_container_table.find_next("tr")]
    sections_trs.extend(sections_trs[0].find_next_siblings("tr", recursive=False))

    term_data: dict = {}
    terms: List[str] = []

    # Parse Sections (Each table is a section)
    for section_tr in sections_trs:
        # Separate into components by row
        section_title_tr = section_tr.find_next("tr")
        section_director_tr = section_title_tr.find_next_sibling("tr")
        section_timetable_tr = section_director_tr.find_next_sibling("tr")

        # Get Term, Section
        term_span = section_title_tr.find_next("span", attrs={"class": "bold"})
        term = term_span.text
        section = re.sub(" +", " ", term_span.parent.find(text=True, recursive=False))

        # Get Section Director
        director = section_director_tr.find("td").find(text=True, recursive=False).replace("Section Director:", "")

        # Get Section Timetable
        times_trs = section_timetable_tr.find_next("tr").find_next_siblings("tr")
        times: List[dict] = []

        # Parse each time slot
        for time_tr in times_trs:
            time_data_trs = time_tr.find_all("td", recursive=False)

            # Easy Lecture Data
            lecture_type = time_data_trs[0].text
            catalog = time_data_trs[2].text
            instructor = time_data_trs[3].text
            notes = time_data_trs[4].text

            # Scheduling Data
            days_trs = time_data_trs[1].find_all("tr")
            days: List[dict] = []

            for day_tr in days_trs:
                day_data = [re.sub("", "", td.text).strip() for td in day_tr.find_all("td")]
                days.append({
                    "day": day_data[0],
                    "time": day_data[1],
                    "duration": day_data[2],
                    "location": day_data[3]
                })

            times.append({
                "type": lecture_type,
                "catalog": catalog,
                "instructor": instructor,
                "times": days,
                "notes": notes
            })

        # Add to term data
        if term not in term_data.keys():
            term_data[term] = []
            terms.append(term)

        term_data[term].append({
            "section": section,
            "director": director,
            "times": times
        })

    return recursive_scrub({
        "desc": desc,
        "lang": lang,
        "schedule": term_data,
        "terms": terms
    })


def parse_course_instructors(html: str) -> List[str]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

    names_trs = soup.find("th", text="Name List").parent.find_next_siblings("tr")
    return [clean(tr.text) for tr in names_trs]


def parse_select_options(html: str, element_id: str) -> List[str]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")
    select = soup.find(attrs={"id": element_id}).findChildren("option", recursive=False)
    return [tag.text for tag in select]


def parse_subject_select_options(html: str, element_id: str) -> List[Tuple[str, str]]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")
    select = soup.find(attrs={"id": element_id}).findChildren("option", recursive=False)
    tags = [tag.text for tag in select]

    subjects = []

    for tag in tags:
        subject = tag[:tag.find("-")].strip()
        faculties = _subject_faculty.findall(tag)[0]

        for faculty in faculties.split(", "):
            subjects.append((faculty, subject))

    return subjects


def parse_dine_data(html: str) -> Dict[str, dict]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")

    tabs_divs = soup.find_all("div", attrs={"role": "tabpanel"}, recursive=True)
    dining_data: dict = dict()

    for tab in tabs_divs:
        table_table: Tag = tab.find("table")

        # Check if it is a dining table
        if "Hours of Operations" not in str(table_table):
            continue

        tab_name = soup.find("li", attrs={"id": tab.attrs['aria-labelledby']}).text
        vendors_trs = table_table.find_next("tbody").find_all("tr")
        dining_info: list = []

        for vendor_tr in vendors_trs:
            vendor_tds = vendor_tr.find_all("td")

            dining_info.append({
                "name": clean(vendor_tds[0].text),
                "schedule": [element for element in list(vendor_tds[1].children) if isinstance(element, str)]
            })

        dining_data[sanitize_name(tab_name)] = {
            "location": tab_name,
            "vendors": dining_info
        }

    return dining_data


def parse_course_schedule_index(html: str) -> List[str]:
    soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html, features="html.parser")
    return [a.text for a in soup.find_all("a") if "html" in a.text]


class CourseScheduleParser:

    def __init__(self, html):
        self.soup: bs4.BeautifulSoup = bs4.BeautifulSoup(html.encode('utf-16').decode('utf-16'), features="html5lib")
        self.data = {}

    def __get_new_course(self, element: Any) -> dict:
        faculty, subject, term, title = (td.text for td in element.find_all("td"))

        return recursive_scrub({
            "faculty": faculty,
            "subject": subject,
            "term": term,
            "title": title,
        })

    def parse(self) -> dict:
        schedule_table_header = self.soup.find("table").find("tr")
        table_rows = schedule_table_header.find_next_siblings("tr", recursive=False)

        courses: List[tuple] = []
        all_info = dict()

        # If there's only ONE table, it's not valid
        if len(table_rows) <= 1:
            return dict()

        # Indices for new courses
        # noinspection PyUnresolvedReferences
        indices = [idx for idx, row in enumerate(table_rows) if row.find("strong")]

        for idx, index in enumerate(indices):
            info = recursive_scrub(self.__get_new_course(table_rows[index]))
            rows = table_rows[indices[idx] + 1: (indices[idx + 1] if idx != len(indices) - 1 else len(table_rows))]
            courses.append((info, rows))

        # Process course data
        for subject_info, course_rows in courses:
            course_id, course_sections = self.__process_course(subject_info, course_rows)

            new_course: bool = not bool(all_info.get(course_id))
            if new_course:
                all_info[course_id] = subject_info
                all_info[course_id]["sections"] = dict()

            # Merge currently available data
            all_info[course_id]["sections"] = {**all_info[course_id]["sections"], **course_sections}

        return all_info

    def __process_course(self, subject_info: dict, course_rows: list) -> Tuple[str, dict]:
        # Indices for new courses
        indices = [idx for idx, row in enumerate(course_rows) if row.find("td").attrs["colspan"] == "3"]

        sections = dict()
        course_num, credit_num = "", ""

        # For each section in the course
        for idx, index in enumerate(indices):
            # Section Info
            section_info = self.__process_course_info(course_rows[index])
            section_info["term"] = subject_info["term"]

            # Pass back course details
            if idx == 0:
                course_num, credit_num = section_info["number"], section_info["credit"]

            # Section Classes
            section = course_rows[indices[idx]: (indices[idx + 1] if idx != len(indices) - 1 else len(course_rows))]
            processed_classes = [self.__process_section(_class) for _class in section]
            section_info["classes"] = processed_classes

            sections[section_info["section"]] = section_info

        # Get ID and return with data
        qualified_name = f"{subject_info['faculty']}-{subject_info['subject']}-{course_num}-{credit_num}"
        return qualified_name, sections

    def __process_course_info(self, info_row):
        row_tds = info_row.find("td").find_next_siblings()
        number, credit, section = tuple(_multi_space.sub(" ", row_tds[0].text).strip().split(" "))
        return recursive_scrub({
            "number": number,
            "credit": credit,
            "section": section,
            "language": row_tds[1].text,
            "notes": row_tds[7].text.replace("n/a", "")
        })

    def __process_section(self, section):
        first_td = section.find("td")
        first_col = int(first_td.attrs["colspan"])

        # Find siblings, standardize colspan differences
        siblings = first_td.find_next_siblings("td")[(3 - (first_col - 2)):]

        # Course Times
        time_trs = siblings[3].find_all("tr")
        schedule: List[Dict[str, str]] = []

        for time_tr in time_trs:
            schedule_info = tuple([td.text for td in time_tr.find_all("td")])

            # New Schedule Format
            if len(schedule_info) == 5:
                day, time, duration, campus, room = schedule_info

            # Legacy ScheduleFormat
            else:
                day, time, duration, room = schedule_info
                campus = None

            schedule.append({
                "day": day,
                "time": time,
                "duration": duration,
                "room": room,
                "campus": campus
            })

        # Convert <br/> to \n for easier parsing
        instructors_cleaned = _multi_space.sub(" ", _nbsp.sub(" ", str(siblings[4]).replace("<br/>", "\n")))
        instruct = bs4.BeautifulSoup(instructors_cleaned, "html5lib")
        instructors = [instructor.strip() for instructor in instruct.text.split("\n") if instructor.strip()]

        return recursive_scrub({
            "type": siblings[0].text,
            "meet": siblings[1].text,
            "category": siblings[2].text,
            "instructors": instructors,
            "schedule": schedule
        })


def parse_teacher_response(data: dict) -> Dict[str, dict]:
    teachers: Dict[str, dict] = dict()

    for teacher in data["data"]["search"]["teachers"]["edges"]:
        tdata: dict = teacher["node"]
        teachers[f"{(tdata['firstName']).strip()} {(tdata['lastName']).strip()}"] = tdata

    return teachers
