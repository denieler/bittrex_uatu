const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'

export const add = (notificationCondition) => {
    chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
        chrome.storage.local.set({
            [NOTIFICATION_CONDITIONS_STORAGE_KEY]: notificationConditions.concat(notificationCondition)
        })
    })
}

export const all = (callback) => {
    chrome.storage.local.get(
        NOTIFICATION_CONDITIONS_STORAGE_KEY, 
        ({notificationConditions}) => callback(notificationConditions)
    )
}

export const removeAll = () => {
    chrome.storage.local.set({
        [NOTIFICATION_CONDITIONS_STORAGE_KEY]: []
    })
}
