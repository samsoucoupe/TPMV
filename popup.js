import {clientId, token, url, twitchUrl, headers } from './constante.js';
import data from './constantes.json' assert { type: "json" };

// fonction pour obtenir l'état de streaming d'un utilisateur
async function getStreamerStatus(username) {
    const response = await fetch(`${url}${username}`, { headers });
    const data = await response.json();
    return data.data.length > 0;
}

// fonction pour ajouter la pastille de streaming à une carte
async function addStreamingBadge(streamerName) {
    const isStreaming = await getStreamerStatus(streamerName);
    const socialLinksDiv = document.querySelector(`div[data-name="${streamerName}"]`);
    socialLinksDiv.classList.add(isStreaming ? 'streaming' : 'not-streaming');
}

// créer les cartes pour chaque streamer
for (let personne in data) {
    const streamer = data[personne];
    const socialLinksDiv = document.createElement('div');
    socialLinksDiv.className = "card";
    socialLinksDiv.style.backgroundImage = `url(images/${personne}.png)`;
    // <div class="card" style="background-image: url(images/vinya_kitsuny.png);">
    const cardImage = document.createElement('img');
    cardImage.src = `images/${personne}.png`;
    cardImage.alt = `${personne} logo`;
    cardImage.className = "card-image";
    // <img src="images/vinya_kitsuny.png" alt="Vinya Kitsuny logo" class="card-image">
    const cardTitle = document.createElement('h2');
    cardTitle.textContent = personne;
    socialLinksDiv.appendChild(cardTitle);
    // <h2>Vinya Kitsuny</h2>
    // <img src="images/vinya_kitsuny.png" alt="Vinya Kitsuny logo" class="card-image">

    // Create div for the status badge
    const statusBadge = document.createElement('div');
    statusBadge.className = 'status-badge';
    socialLinksDiv.appendChild(statusBadge);
    const statusText = document.createElement('p');
    statusText.className = 'status-text';
    socialLinksDiv.appendChild(statusText);

    // Fetch stream info from Twitch API
    fetch(`${url}${personne}`, { headers })
        .then(response => response.json())
        .then(json => {
            if (json.data && json.data.length > 0) {
                // Stream is online
                statusBadge.classList.add('online');
                // Add text to status badge
                statusText.textContent = "ON LIVE";

                // Add click event to card
                socialLinksDiv.addEventListener('click', () => {
                    window.open(`${twitchUrl}${personne}`, '_blank');
                }
                );
            } else {
                // Stream is offline
                statusBadge.classList.add('offline');
            }
        })
        .catch(error => console.error(error));

    const linksList = document.createElement('ul');
    for (let linkType in streamer["Social-link"]) {
        const link = streamer["Social-link"][linkType];
        const linkListItem = document.createElement('li');
        const linkAnchor = document.createElement('a');
        const linkIcon = document.createElement('img');
        const linkIconName = linkType.replace(" ", "_").toLowerCase();
        linkIcon.className = "icon";
        linkIcon.src = `images/${linkIconName}.png`;
        linkIcon.alt = `${linkType} icon`;
        linkAnchor.href = link;
        linkAnchor.target = "_blank";
        linkAnchor.appendChild(linkIcon);
        linkListItem.appendChild(linkAnchor);
        linksList.appendChild(linkListItem);
        // <ul>
        //     <li>
        //         <a href= `https://www.twitch.tv/${personne}` target="_blank">
        //             <img src="images/twitch.png" alt="Twitch icon">
        //         </a>
        //     </li>
        // </ul>
    }
    socialLinksDiv.appendChild(linksList);
    document.getElementById('social-links').appendChild(socialLinksDiv);
}


