//this oage for modal functions

document.addEventListener("keydown", keyChecker);


let generalinfoModal = document.getElementById("generalinfo")
console.log('generalinfoModal:\n',generalinfoModal)
console.log('classList:\n',generalinfoModal.classList)
const menuModal = document.getElementById('menu')
const calendarModal = document.getElementById('calendar')
const reservationModal = document.getElementById('reservation')
const mtgpageModal = document.getElementById('mtgpage')






function keyChecker(e){
    console.log('User pressed: ', e.code)
    if(e.code == 'KeyQ'){
        closeAllModals()
    }
    if(e.code =='KeyF'){
        console.log('Open GeneralInfo')
        console.log('selector: \n', generalinfoModal)
        console.log('selector.classList: \n', generalinfoModal.classList)
        generalinfoModal.classList.replace('inactive','active')
        
    }
    if(e.code =='KeyG'){
        console.log('Open Menu')
        menuModal.classList='active'
    }
    if(e.code =='KeyH'){
        console.log('Open Calendar')
        calendarModal.classList='active'
    }
    if(e.code =='KeyJ'){
        console.log('Open Reservations')
        reservationModal.classList='active'
    }
    if(e.code =='KeyK'){
        console.log('Open MTG page')
        mtgpageModal.classList='active'
    }
}

function closeAllModals(){
    console.log('Close the modals')
    generalinfoModal.classList='inactive'
    menuModal.classList='inactive'
    calendarModal.classList='inactive'
    reservationModal.classList='inactive'
    mtgpageModal.classList='inactive'
}


