const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'

export const add = (notificationCondition) => {
    if (!chrome.storage)
        return

    chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
        chrome.storage.local.set({
            [NOTIFICATION_CONDITIONS_STORAGE_KEY]: notificationConditions.concat(notificationCondition)
        })
    })
}

export const all = (callback) => {
    if (!chrome.storage)
        callback([])
        return

    chrome.storage.local.get(
        NOTIFICATION_CONDITIONS_STORAGE_KEY, 
        ({notificationConditions}) => callback(notificationConditions)
    )
}

export const removeAll = () => {
    if (!chrome.storage)
        return

    chrome.storage.local.set({
        [NOTIFICATION_CONDITIONS_STORAGE_KEY]: []
    })
}
