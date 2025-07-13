import pandas as pd
import zipfile
import os
from django.core.files.base import ContentFile
from core.models import Question, Solution, Option, AnswerKey, QuestionType, Topic, Chapter, User, QuestionImage, SolutionImage, AnswerKeyImage
from django.conf import settings
from docx import Document

def process_bulk_upload(data_file, images_zip=None, user=None):
    filename = data_file.name.lower()
    if filename.endswith('.csv'):
        df = pd.read_csv(data_file)
    elif filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(data_file)
    elif filename.endswith('.docx'):
        df = parse_word_questions(data_file)
    else:
        raise ValueError('Unsupported file format!')

    image_map = {}
    if images_zip:
        with zipfile.ZipFile(images_zip) as z:
            for name in z.namelist():
                image_map[os.path.basename(name)] = z.read(name)

    results = {'questions': 0, 'options': 0, 'solutions': 0, 'answer_keys': 0, 'images': 0, 'errors': []}

    for idx, row in df.iterrows():
        try:
            # Basic fields
            chapter, _ = Chapter.objects.get_or_create(name=row.get('Chapter', 'Default'))
            topic, _ = Topic.objects.get_or_create(name=row.get('Topic', 'Default'), chapter=chapter)
            qtype, _ = QuestionType.objects.get_or_create(name=row.get('QuestionType', 'MCQ'))
            question = Question.objects.create(
                text=row.get('QuestionText', ''),
                content=row.get('QuestionContent', ''),
                level=row.get('Level', 'easy'),
                qtype=qtype,
                topic=topic,
                created_by=user if user else None
            )
            results['questions'] += 1
            # Question images
            for img_col in [c for c in row.index if c.startswith('QuestionImage')]:
                img_name = row[img_col]
                if img_name and img_name in image_map:
                    QuestionImage.objects.create(question=question, image=ContentFile(image_map[img_name], name=img_name))
                    results['images'] += 1
            # Options (bulk or per-question)
            for i in range(1, 11):
                opt_text = row.get(f'Option{i}', None)
                if pd.notna(opt_text):
                    is_correct = str(row.get('CorrectOption', '')).strip() == str(i)
                    Option.objects.create(question=question, text=opt_text, is_correct=is_correct)
                    results['options'] += 1
            # Solutions
            sol_text = row.get('SolutionText', None)
            if pd.notna(sol_text):
                solution = Solution.objects.create(question=question, text=sol_text, content=row.get('SolutionContent', ''), created_by=user)
                results['solutions'] += 1
                for img_col in [c for c in row.index if c.startswith('SolutionImage')]:
                    img_name = row[img_col]
                    if img_name and img_name in image_map:
                        SolutionImage.objects.create(solution=solution, image=ContentFile(image_map[img_name], name=img_name))
                        results['images'] += 1
            # Answer Keys
            ans_text = row.get('AnswerKey', None)
            if pd.notna(ans_text):
                answer_key = AnswerKey.objects.create(question=question, answer=ans_text, content=row.get('AnswerKeyContent', ''), created_by=user)
                results['answer_keys'] += 1
                for img_col in [c for c in row.index if c.startswith('AnswerKeyImage')]:
                    img_name = row[img_col]
                    if img_name and img_name in image_map:
                        AnswerKeyImage.objects.create(answer_key=answer_key, image=ContentFile(image_map[img_name], name=img_name))
                        results['images'] += 1
        except Exception as e:
            results['errors'].append(f'Row {idx+2}: {str(e)}')
    return results

def parse_word_questions(data_file):
    # Placeholder: Parse .docx for question data; for now, just return an empty DataFrame
    # You can expand this to extract tables or structured data from Word files
    return pd.DataFrame()
