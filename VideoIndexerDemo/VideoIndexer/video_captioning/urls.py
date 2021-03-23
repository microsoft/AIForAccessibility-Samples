# Copyright (c) Microsoft Corporation.
# Licensed under the MIT license.

import os

from dotenv import load_dotenv

load_dotenv()

VIDEO_INDEXER_URL = 'https://api.videoindexer.ai/{}/Accounts/{}/Videos/{}/SourceFile/DownloadUrl'
VIDEO_INDEXER_GET_ACCOUNTS = 'https://api.videoindexer.ai/Auth/{}/Accounts'
VIDEO_INDEXER_TOKEN = 'https://api.videoindexer.ai/auth/{}/Accounts/{}/AccessToken'
VIDEO_INDEXER_UPLOAD = 'https://api.videoindexer.ai/{}/Accounts/{}/Videos'
VIDEO_INDEXER_CAPTION = 'https://api.videoindexer.ai/{}/Accounts/{}/Videos/{}/Captions'
VIDEO_INDEXER_CREATE_MODEL = 'https://api.videoindexer.ai/{}/Accounts/{}/Customization/Language'
VIDEO_INDEXER_TRAIN_MODEL = 'https://api.videoindexer.ai/{}/Accounts/{}/Customization/Language/{}/Train'
VIDEO_INDEXER_GET_ARTIFACT_URL = 'https://api.videoindexer.ai/{}/Accounts/{}/Videos/{}/ArtifactUrl'
VIDEO_INDEXER_INDEX = 'https://api.videoindexer.ai/{}/Accounts/{}/Videos/{}/Index'

