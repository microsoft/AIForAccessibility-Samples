# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

from dotenv import load_dotenv
load_dotenv()

import os
import json
import requests
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, flash, request, redirect, url_for, session
from video_captioning.main import upload_video, video_callback, train_custom_speech

executor = ThreadPoolExecutor(max_workers=20)
app = Flask("layout_detection")

@app.route('/api/v1/vc', methods=['POST'])
def vc_upload():
    params = request.get_json()
    return_data = upload_video(params)
    return json.dumps(return_data)

@app.route('/api/v1/customspeech', methods=['POST'])
def customspeech_train():
    params = request.get_json()
    return_data = train_custom_speech(params)
    return json.dumps(return_data)

@app.route('/api/v1/vc/callback', methods=['POST'])
def vc_callback():
    params = request.get_json()
    return video_callback(request.args.get('id'))

if __name__ == "__main__":
    app.run(port=5000, debug=True, host='0.0.0.0')