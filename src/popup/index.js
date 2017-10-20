const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'

function onSave () {
    const currencySymbol = document.getElementById('symbol').value
    const lessThan = document.getElementById('less-than').value

    const notificationCondition = {
        currency: currencySymbol,
        condition: '<=',
        value: parseFloat(lessThan),
        off: false
    }

    chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
        chrome.storage.local.set({
            [NOTIFICATION_CONDITIONS_STORAGE_KEY]: notificationConditions.concat(notificationCondition)
        })
    })
}

function loadExistingNotificationConditions () {
    const notificationConditionsDiv = document.getElementById('notification-conditions')

    chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
        notificationConditions.forEach(c => {
            var node = document.createElement('DIV')
            var textnode = document.createTextNode(c.currency + ' ' + c.condition + ' ' + c.value)
            node.appendChild(textnode)

            if (!c.off) {
                node.style.color = 'green'
            }

            notificationConditionsDiv.appendChild(node) 
        })
    })
}

document.addEventListener('DOMContentLoaded', _ => {
    loadExistingNotificationConditions()

    document.getElementById('save-button').addEventListener('click', onSave)
})
