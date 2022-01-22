import imp
from multiprocessing.spawn import import_main_path
from re import M
from urllib import request
from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random 
import time
import json

from .models import RoomMember

from django.views.decorators.csrf import csrf_exempt

#Build token with uid
def getToken(request):
    appId = 'f3fec87093bd4bac90e8609acbd5cc20'
    appCertificate = '741fd52dcebd470989d56344dd1c50d0'
    channelName = request.GET.get('channel')
    uid = random.randint(1,230)
    expirationTimeInSeconds= 3600 *24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp +expirationTimeInSeconds 
    role = 1
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid,},safe=False)


# Create your views here.
def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')


@csrf_exempt
def createMember(request):
    data  = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )
    return JsonResponse({'name': data['name']},safe=False)


def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid = uid,
        room_name = room_name,

    )

    return JsonResponse({'name':member.name}, safe=False)


@csrf_exempt
def deleteMember(request):
    data  = json.loads(request.body)
    member = RoomMember.objects.get(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )
    member.delete()
    return JsonResponse('Member was deleted',safe=False)