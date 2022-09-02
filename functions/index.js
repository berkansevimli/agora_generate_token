const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().functions);
const {RtcTokenBuilder, RtcRole} = require('agora-access-token')


var newData;



//VIDEO CHAT NOTİFİCATİONS
exports.videoNotification = functions.firestore.document("VideoChat/{chatID}").onCreate( async (snapshot, context) => {
    if(snapshot.empty){
        console.log('NO DEVICES');
        return;
    }

    newData = snapshot.data();
    

    //GENERATE TOKEN
    const appID = 'APP_ID';
    const appCertificate = 'APP_CERTIFICATE';
    const channelName = newData.channelName;
    const uid = 0;
    const account = "accounName";
    const role = RtcRole.PUBLISHER;
    console.log('channelName: ' + channelName)
    console.log('app ID: '+ appID)

    //Token will be expire in 1 hour
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Build token with uid
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + tokenA);



    //UPDATE DOCUMENT WITH TOKEN
    var db = admin.firestore();
    const response  = await db.collection("VideoChat").doc(snapshot.id).update({'token': tokenA,});
    console.log(response.message)

    var tokens = [];
    tokens = newData.receivers;

    var payload ={
        notification: {
            title: "Görüntülü Konuşma İsteği",
            body: newData.senderName,
            sound: 'default',
        },

        data:
        {
            token: tokenA,
            channelName: newData.channelName,
            type:"video",
            img:newData.img,
            senderName: newData.senderName


        },
      
    }

    //SEND NOTIFICATION WITH FIREBASE CLOUD MESSAGING
    try {
        for(t of tokens){
            const response = await admin.messaging().sendToDevice(t, payload,   {
                // Required for background/quit data-only messages on iOS
                contentAvailable: true,
                // Required for background/quit data-only messages on Android
                priority: "high",
              });
            console.log('notification sended! ' + 'to : '+ t);
        }
       
    } catch (error) {

        console.log('Error: '+error.message);
        
    }


})


//Voice CHAT NOTİFİCATİONS
exports.voiceChat = functions.firestore.document("VoiceChat/{chatID}").onCreate( async (snapshot, context) => {
    if(snapshot.empty){
        console.log('NO DEVICES');
        return;
    }

    newData = snapshot.data();
    

    //GENERATE TOKEN
    const appID = 'APP_ID';
    const appCertificate = 'APP_CERTIFICATE';
    const channelName = newData.channelName;
    const uid = 0;
    const account = "accounName";
    const role = RtcRole.PUBLISHER;
    console.log('channelName: ' + channelName)
    console.log('app ID: '+ appID)

    //Token will be expire in 1 hour
    const expirationTimeInSeconds = 3600
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Build token with uid
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    console.log("Token With Integer Number Uid: " + tokenA);



    //UPDATE DOCUMENT WITH TOKEN
    var db = admin.firestore();
    const response  = await db.collection("VoiceChat").doc(snapshot.id).update({'token': tokenA,});
    console.log(response.message)

    var tokens = [];
    tokens = newData.receivers;

    var payload ={
        notification: {
            title: "Sesli Konuşma İsteği",
            body: newData.senderName,
            sound: 'default',
        },

        data:
        {
            token: tokenA,
            channelName: newData.channelName,
            type:"voice",
            img:newData.img,
            senderName: newData.senderName

        },
      
    }

    //SEND NOTIFICATION WITH FIREBASE CLOUD MESSAGING
    try {
        for(t of tokens){
            const response = await admin.messaging().sendToDevice(t, payload,   {
                // Required for background/quit data-only messages on iOS
                contentAvailable: true,
                // Required for background/quit data-only messages on Android
                priority: "high",
              });
            console.log('notification sended! ' + 'to : '+ t);
        }
       
    } catch (error) {

        console.log('Error: '+error.message);
        
    }


})

//Message Notifications
exports.chatNotification = functions.firestore.document("MessageChatNotify/{notifyId}").onCreate( async (snapshot, context) => {
    if(snapshot.empty){
        console.log('NO DEVICES');
        return;
    }

    messageData = snapshot.data();
    


    var tokens = [];
    tokens = messageData.receivers;

    var payload ={
        notification: {
            title: "Yeni Mesaj",
            body: messageData.senderName + ': ' + messageData.message,
            sound: 'default',
        },

        data:
        {
            message: messageData.message,
        },
      
    }

    //SEND NOTIFICATION WITH FIREBASE CLOUD MESSAGING
    try {
        for(t of tokens){
            const response = await admin.messaging().sendToDevice(t, payload,   {
                // Required for background/quit data-only messages on iOS
                contentAvailable: true,
                // Required for background/quit data-only messages on Android
                priority: "high",
              });
            console.log('notification sended! ' + 'to : '+ t);
        }
       
    } catch (error) {

        console.log('Error: '+error.message);
        
    }


})



