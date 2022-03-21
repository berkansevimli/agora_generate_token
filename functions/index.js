const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().functions);
const {RtcTokenBuilder, RtcRole} = require('agora-access-token')


var newData;



//GET DOCUMENT CHANGES
exports.messageNotification = functions.firestore.document("VideoChat/{chatID}").onCreate( async (snapshot, context) => {
    if(snapshot.empty){
        console.log('NO DEVICES');
        return;
    }

    newData = snapshot.data();
    

    //GENERATE TOKEN
    const appID = 'app_id';
    const appCertificate = 'ap_certificate';
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
            channelName: newData.channelName
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

