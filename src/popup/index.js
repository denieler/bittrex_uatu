(function () {
    const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'

    function onSave () {
        const currencySymbol = document.getElementById('symbol').value
        const amount = document.getElementById('amount').value
        const condition = document.getElementById('conditions-dropdown').value

        const notificationCondition = {
            currency: currencySymbol,
            condition: condition,
            value: parseFloat(amount),
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

    function initDropdownWithConditions () {
        const dropdown = document.getElementById('conditions-dropdown')

        const conditions = [
            '<=',
            '>=',
            '<',
            '>'
        ]

        conditions.forEach(c => {
            var node = document.createElement('OPTION')
            node.value = c
            var textnode = document.createTextNode(c)
            node.appendChild(textnode)
            dropdown.appendChild(node)
        })
    }

    document.addEventListener('DOMContentLoaded', _ => {
        loadExistingNotificationConditions()

        document.getElementById('save-button').addEventListener('click', onSave)
        initDropdownWithConditions()
    })
})()