# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

# Load in the environment variables from .env file
from dotenv import load_dotenv

load_dotenv()
from bson.json_util import dumps

# Module imports
import requests
import io
import os
import json
import uuid
import video_captioning.urls as request_url
import urllib.request as urllib
import math
import nltk
from zipfile import ZipFile

location = os.environ.get('location')
account_id = os.environ.get('account_id')
subscription_key = os.environ.get('subscription_key')
cv_key = os.environ.get('CV_KEY')
cv_endpoint = os.environ.get('CV_ENDPOINT')

# Constants
locale = 'en-us' # locale for custom speech models
thumbnail_file_prefix = 'KeyFrameThumbnail_'
thumbnail_file_extension = '.jpg'
returned_description_length_threshold = 2
returned_description_confidence_threshold = 0.3
verb_tag = 'VB'

try:
    nltk.data.find('averaged_perceptron_tagger')
except:
    nltk.download('averaged_perceptron_tagger')

try:
    nltk.data.find('punkt')
except:
    nltk.download('punkt')

def get_account_token():
    url = request_url.VIDEO_INDEXER_GET_ACCOUNTS.format(location)
    params = {'generateAccessTokens' : True, 'allowEdit' : True}
    requestId = str(uuid.uuid4())
    headers = {'Ocp-Apim-Subscription-Key': subscription_key, 'x-ms-client-request-id': requestId}
    res = requests.get(url=url, params=params, headers=headers)
    token = ''
    if res.status_code == 200:
        token =  [x for x in res.json() if x['accountType'] == 'Paid'][0]['accessToken']
    else:
        print("fail to obtain account access token: " + res.text)
    print("generated token: " + token)
    return token

def upload_video(request_data):
    account_access_token = get_account_token()
    url = request_url.VIDEO_INDEXER_UPLOAD.format(
        location, account_id)
    params = {
        'accessToken': account_access_token,
        'name': request_data.get('name'),
        'language': 'auto',
        'videoUrl': request_data.get('url'),
        'streamingPreset': 'Default',
        'externalId': request_data.get('hash'),
        'privacy': 'Private',
        'callbackUrl': os.environ.get('VIDEO_INDEXER_CALLBACK_SERVER') + '/api/v1/vc/callback'
    }

    if request_data.get('languageModelId'):
        params['linguisticModelId'] = request_data.get('languageModelId')

    headers = {'Content-Type': 'multipart/form-data', 'x-ms-client-request-id': str(uuid.uuid4())}
    res = requests.post(url=url, params=params, headers=headers)

    data = res.json()
    if 'id' in data:
        videoId = data['id']
        return {'error': False, 'message': 'Video Uploaded Successfully', 'videoId': videoId}
    return {'error': True, 'message': 'Error in Uploading Video'}

def train_custom_speech(request_data):
    account_access_token = get_account_token()
    model_name = request_data.get('name')
    url = request_url.VIDEO_INDEXER_CREATE_MODEL.format(
        location, account_id)
    params= {
        'accessToken': account_access_token,
        'modelName': request_data.get('name'),
        'language': locale
    }

    json = {
        request_data.get('fileName'): (None, request_data.get('fileUrl'), None)
    }

    headers = {'x-ms-client-request-id': str(uuid.uuid4())}

    res = requests.post(url = url, params = params, headers = headers, files = json)

    data = res.json()

    if data["files"] and len(data["files"]) > 0:
        model_id = data["id"]
        training_url = request_url.VIDEO_INDEXER_TRAIN_MODEL.format(
            location, account_id, model_id)
        params = {
            'accessToken': account_access_token
        }
        res = requests.put(url = training_url, params = params, headers = headers)

        data = res.json()

        if data['languageModelId'] and len(data['languageModelId']) > 0:
                return {'error': False, 'message': 'Custom speech model successfully trained', 'languageModelId': data['languageModelId']}

    return {'error': True, 'message': 'Error in Uploading Video'}

def video_callback(video_id):
    captions = get_captions(video_id) or ""
    text = get_text(video_id) or []
    descriptions = get_image_descriptions(video_id) or []

    if captions is None and text is None and descriptions is None:
        return {'error': True, 'message': 'Error in extracting captions and text'}
    else:
        return         {'error': False, 'message': 'Successfully extracted text and captions', 'captions': captions, 'text': text, 'descriptions': descriptions, 'videoId': video_id}

def get_captions(video_id):
    url = request_url.VIDEO_INDEXER_CAPTION.format(location, account_id, video_id)
    params = {"format": "vtt", "accessToken" : get_account_token(), "language": "en-US"}
    headers = { 
                'Ocp-Apim-Subscription-Key' : subscription_key}
    res = requests.get(url=url, params=params, headers=headers)
    if res.status_code == 200:
        return res.text.replace("\r\n", "\n")

def get_jaccard_similarity(list1, list2):
    str1List = [elem.split() for elem in list1]
    list1Flattened = [item for sublist in str1List for item in sublist]
    str2List = [elem.split() for elem in list2]
    list2Flattened = [item for sublist in str2List for item in sublist]
    intersection = len(list(set(list1Flattened).intersection(list2Flattened)))
    union = (len(list1Flattened) + len(list2Flattened)) - intersection
    return float(intersection) / union

def get_timestamp_from_seconds(number_of_seconds):
    hours = math.floor(number_of_seconds / 3600.0)
    minutes = math.floor((number_of_seconds - (hours * 3600)) / 60.0)
    seconds = math.floor((number_of_seconds - ((hours * 3600) + (minutes * 60))))
    return str(hours).zfill(2) + ":" + str(minutes).zfill(2) + ":" + str(seconds).zfill(2)

def process_extracted_text(ocr_text):
    parsedJson = json.loads(ocr_text)
    english_words = []

    f  = open("englishWords.txt")
    for line in f:
        english_words.append(line.rstrip("\n"))
    f.close()

    eventResults = []
    finalResults = []

    timescale = parsedJson['timescale']
    for fragment in parsedJson['fragments']:
        fragmentResults = []

        startTime = get_timestamp_from_seconds(fragment['start'] / timescale)
        endTime = get_timestamp_from_seconds((fragment['start'] + fragment['duration']) / timescale)
        if 'events' in fragment.keys():
            for event in fragment['events']:
                temp = []
                tempConfidence = []

                if len(event) == 0:
                    continue

                for elem in event:
                    eventText = ""
                    confidence = 0
                    for line in elem['region']['lines']:
                        eventText = eventText + " \n " + line['text'] if len (eventText) > 0 else line['text']
                        confidence = confidence + sum([float(word['confidence']) for word in line['word']]) / len(line['word'])
                    temp.append(eventText)
                    tempConfidence.append(confidence / len(elem['region']['lines']))

                maxConfidenceIdx = tempConfidence.index(max(tempConfidence))

                if len(eventResults) > 0 and (eventResults[-1] == temp[maxConfidenceIdx] or get_jaccard_similarity(temp[maxConfidenceIdx], eventResults[-1]) > 0.5):
                    continue

                eventResults.append(temp[maxConfidenceIdx])
                fragmentResults.append(temp[maxConfidenceIdx])

        if len(fragmentResults) > 0:
            englishWordFrequency  = []

            for sentence in fragmentResults:
                counter = 0
                for token in nltk.tokenize.word_tokenize(sentence.rstrip("\n")):
                    if token.lower() in english_words:
                        counter = counter + 1
                englishWordFrequency.append(counter)

            print(englishWordFrequency)
            mostAccurateIdx = englishWordFrequency.index(max(englishWordFrequency))

            finalResultsObj = {"startTime": startTime, "endTime": endTime, "results": fragmentResults[mostAccurateIdx]}
            finalResults.append(finalResultsObj)

    return finalResults

def get_text(video_id):
    url = request_url.VIDEO_INDEXER_GET_ARTIFACT_URL.format(location, account_id, video_id)
    params = {"accessToken": get_account_token(), "language": "en-US", "type": "Ocr"}
    headers = { 
                'Ocp-Apim-Subscription-Key' : subscription_key}
    res = requests.get(url=url, params=params, headers=headers)
    if res.status_code == 200:
        resultUrl = res.text[1:-1]
        res = requests.get(url=resultUrl, params=params, headers=headers)
        if res.status_code == 200 and "lines" in res.text:
            return process_extracted_text(res.text)

def extract_zip(input_zip):
    input_zip = ZipFile(io.BytesIO(input_zip))
    return {name: input_zip.read(name) for name in input_zip.namelist()}

def check_for_verbs(nltk_result):
    for elem in nltk_result:
        if verb_tag in elem[1]:
            return True
    return False

def get_image_descriptions(video_id):
    url = request_url.VIDEO_INDEXER_INDEX.format(location, account_id, video_id)
    params = {"accessToken": get_account_token(), "language": "en-US"}
    headers = { 
                'Ocp-Apim-Subscription-Key' : subscription_key}
    res = requests.get(url=url, params=params, headers=headers)

    if not(res.status_code == 200):
        return

    descriptions = []

    shots = res.json()['videos'][0]['insights']['shots']
    for shot in shots:
        for keyframe in shot['keyFrames']:
            for instance in keyframe['instances']:
                descriptions.append({
                    'thumbnailId': instance['thumbnailId'],
                    'startTime': instance['adjustedStart'],
                    'endTime': instance['adjustedEnd']
                })

    url = request_url.VIDEO_INDEXER_GET_ARTIFACT_URL.format(location, account_id, video_id)
    params = {"accessToken": get_account_token(), "language": "en-US", "type": "KeyframesThumbnails"}
    headers = { 
                'Ocp-Apim-Subscription-Key' : subscription_key}
    res = requests.get(url=url, params=params, headers=headers)

    if res.status_code == 200:
        resultUrl = res.text[1:-1]
        res = requests.get(url=resultUrl, params=params, headers=headers)

        if res.status_code == 200:
            files = extract_zip(res.content)

            for i in range(len(descriptions)):
                analyze_url = cv_endpoint + "vision/v3.1/analyze"
                headers = {'Ocp-Apim-Subscription-Key': cv_key, 'Content-Type': 'application/octet-stream'}
                params = {'visualFeatures': 'Description'}
                response = requests.post(analyze_url, headers = headers, params = params, data = files[thumbnail_file_prefix + descriptions[i]['thumbnailId'] + thumbnail_file_extension])
                if response.status_code == 200:
                    analysis = response.json()
                    returnedDescription = analysis['description']['captions'][0]['text'] 
                    returnedConfidence = analysis['description']['captions'][0]['confidence']
                    descriptions[i]['description'] = returnedDescription if returnedConfidence > returned_description_confidence_threshold and len(returnedDescription) >= returned_description_length_threshold and check_for_verbs(nltk.pos_tag(nltk.tokenize.word_tokenize(returnedDescription))) and returnedDescription != descriptions[i-1]['description'] else ""

            descriptions = [elem for elem in descriptions if len(elem['description']) > 0]
            return descriptions