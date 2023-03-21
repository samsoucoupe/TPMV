const clientId = 'pky2lv65ypwl2dmwqxdilf8douilp9';
const token = 'vucx1q9qimypicn6cj5yzph6yumf5m';

const url = `https://api.twitch.tv/helix/streams?user_login=`;
const twitchUrl = `https://www.twitch.tv/`;
const headers = {
    'Authorization': `Bearer ${token}`,
    'Client-ID': clientId
}


let dernierStreamClique = null;

// faire un dictionnaire avec les streamers et leur état (True or False) à partir de constantes.json


let streamers = {};
fetch('constantes.json')
    .then(response => response.json())
    .then(data => {
        for (let personne in data) {
            // recupere l'etat dans le fichier constantes.json et le met dans le dictionnaire streamers
            streamers[personne] = data[personne]["State"];
        }
    });


function NouveauStream(personne) {
    const wasLive = streamers[personne];
    chrome.notifications.create(personne, {
        title: `${personne} est en live !`,
        iconUrl: `images/${personne}.png`,
        message: 'Rejoins le live dès maintenant !',
        type: 'basic'
    }, (notificationId) => {
        if (notificationId === personne) {
            if (!chrome.notifications.onClicked.hasListeners()) {
                chrome.notifications.onClicked.addListener((clickedNotificationId) => {
                    const personne = clickedNotificationId;
                    dernierStreamClique = personne;
                    url_a_lancer = twitchUrl + personne;
                    console.log(url_a_lancer);
                    chrome.tabs.create({ url: url_a_lancer });
                });
            }

            if (!chrome.notifications.onClosed.hasListeners()) {
                chrome.notifications.onClosed.addListener((closedNotificationId, byUser) => {
                    if (byUser) {
                        dernierStreamClique = closedNotificationId;
                    }
                });
            }

            streamers[personne] = true;
            if (wasLive !== streamers[personne]) {
                console.log(`Stream state for ${personne} changed to live`);
            }
        }
    });
}


function FinStream(personne) {
    const wasLive = streamers[personne];
    const link = twitchUrl + personne;
    chrome.notifications.create(link, {
        title: `${personne} n'est plus en live !`,
        iconUrl: `images/${personne}.png`,
        message: "N'hésite pas à revenir me voir en live !",
        type: 'basic'
    });

    streamers[personne] = false; // update the streamer's state in the dictionary to false

    // add a wait until condition to check if the new state is different from the previous state
    chrome.waitUntil(() => streamers[personne] !== wasLive).then(() => {
        if (streamers[personne]) {
            NouveauStream(personne);
        }
    });
}





verifierEtatDiffusionEnDirect = () => {
    for (let personne in streamers) {
        const apiUrl = url + personne;
        fetch(apiUrl, {
            headers: headers
        }).then((response) => {
            return response.json();
        }).then((json) => {
            const isLive = json.data.length > 0;
            const wasLive = streamers[personne];
            if (isLive && !wasLive) {
                NouveauStream(personne);
                streamers[personne] = true;
            } else if (!isLive && wasLive) {
                FinStream(personne);
                streamers[personne] = false;
            }
        }).catch((error) => {
            console.error(`Error checking stream status for ${personne}:`, error);
        });
    }
};


// set interval de 5 secondes qui lance verifierEtatDiffusionEnDirect et qui met à jour le dictionnaire streamers et qui notifie le service worker pour qu'il recharge la page

setInterval(() => {
    verifierEtatDiffusionEnDirect();
    chrome.runtime.sendMessage({ streamers: streamers });

}, 5000);



