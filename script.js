let songs;
let currfolder;
let currentsong = new Audio()

function formatTime(seconds) {
    seconds = Number(seconds);
    if (isNaN(seconds) || seconds < 0) return "00:00";

    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60); // floor to remove decimals

    return String(minutes).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
}

const playmusic = function (track, pause = false) {
    currentsong.src = `/${currfolder}/` + track + ".mp3"
    document.querySelector('.songname').innerHTML = (track.includes('_') ? track.split('_')[0] : track.split('-')[1]).replaceAll('%20', " ")
    document.querySelector('.duration').innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`

    if (!false) {
        pause.src = "pause.svg"
    }
}


async function getSongs(folder) {
    currfolder = folder;
    let data = await fetch(`http://127.0.0.1:3000/${currfolder}/`)
    let response = await data.text()
    let div = document.createElement('div');
    div.innerHTML = response;
    as = div.getElementsByTagName('a')

    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split('/')[5].replaceAll("%20", ' ').replace('.mp3', ''))
        }
    }

    let songcard = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songcard.innerHTML = ""

    for (let song of songs) {
        let displaysong = song.includes('_') ? song.split('_')[0] : song.split('-')[1]
        songcard.innerHTML += `<li class="songcard flex" data-song="${song}">
        <img class="inverted" src="music.svg" alt="">
        <div class="info">
        <h3>${displaysong}</h3>
        </div>
        <div class="playnow">
        <p>Play Now</p>
        <img src="play.svg" alt="">
        </div>
        </li>`
    }

    //Play song
    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playmusic(e.dataset.song)
            currentsong.play()
            pause.src = "pause.svg"
        })
    })
    return songs

}

async function getAlbums() {
    let data = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await data.text()
    let div = document.createElement('div');
    div.innerHTML = response;
    as = div.getElementsByTagName('a')
    cards = document.querySelector('.cards')
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (as[i].href.includes('songs')) {
            let foldername = as[i].href.split('/').slice(-2)[0]
            let data = await fetch(`http://127.0.0.1:3000/songs/${foldername}/info.json`)
            let response = await data.json()
            cards.innerHTML += `<div class="card flex" data-folder="${foldername}">
                    <img src="songs/${foldername}/cover.jpg" alt="">
                    <h2 class="">${response.title}</h2>
                    <span>${response.discription}</span>
                    <div class="play"><img src="play.svg" alt=""></div>
                </div>`
        }
    }
}

async function main() {

    await getAlbums()

    await getSongs("songs/sad songs");

    playmusic(songs[0], true)

    // Adding event listener to the cards
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async (i) => {
            songs = await getSongs(`songs/${i.currentTarget.dataset.folder}`)
            playmusic(songs[0])
            currentsong.play()
            pause.src = "pause.svg"
        })
    })

    //add event listeners to previous and next buttons
    console.log(currentsong.src)
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/')[5].replace('.mp3', '').replaceAll('%20', ' '));
        if (index > 0) {
            playmusic(songs[index - 1]);
            currentsong.play()
            pause.src = "pause.svg"
        }
    });

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/')[5].replace('.mp3', '').replaceAll('%20', ' '));
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
            currentsong.play()
            pause.src = "pause.svg"
        }
    })

    //playbar controls
    document.querySelector('#pause').addEventListener('click', () => {

        if (currentsong.paused) {
            pause.src = "pause.svg"
            currentsong.play()
        }
        else {
            currentsong.pause()
            pause.src = "play.svg"
        }

    })

    currentsong.addEventListener('timeupdate', () => {
        document.querySelector('.duration').innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector('.circle').style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%'
    })

    document.querySelector('.timer').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector('.circle').addEventListener('ondrag', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    if (document.body.clientWidth <= 830) {
        document.querySelector('#hamburger').addEventListener('click', () => {
            document.querySelector('.left').style.left = "0"
            plus.src = "close.svg"
        })
        document.querySelector('#plus').addEventListener('click', () => {
            document.querySelector('.left').style.left = "-100%"
        })
    }

    let volume = document.querySelector('.volume input')
    volume.value = 100
    // Event listener for sound
    volume.addEventListener('click', (e) => {
        console.log(`volume:${e.target.value}`)
        currentsong.volume = e.target.value / 100
        if (volume.value == 0) {
            document.querySelector('.volume img').src = "mute.svg"
        } else {
            document.querySelector('.volume img').src = "sound.svg"
        }
    })
    document.querySelector('.volume img').addEventListener('click', (e) => {
        if (currentsong.volume != 0) {
            currentsong.volume = 0
            volume.value = 0
            console.log("volume:", currentsong.volume)
            e.target.src = "mute.svg"
        }
        else {
            currentsong.volume = 0.2
            console.log("volume:", currentsong.volume * 100)
            e.target.src = "sound.svg"
            volume.value = 20
        }
    })
}
main();