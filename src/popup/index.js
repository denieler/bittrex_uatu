import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid/v1'

const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'
const LESS_OR_EQUAL = '<='

class NotificationConditionsList extends Component {
    onClearConditions () {
        this.props.clearConditions()
    }

    render () {
        return (
            <div className='notifications-list'>
                <div className='notifications-list__list'>
                {
                    this.props.conditionsList 
                    ? this.props.conditionsList.map(
                        c => (
                            <div style={c.off ? {} : {color: 'green'}} key={uuid()}>
                                {c.currency} {c.condition} {c.value}
                            </div>
                        )
                    )
                    : null
                }
                </div>

                <div className='notifications-list__clear-button'>
                    <button onClick={_ => this.onClearConditions()}>Clear All</button>
                </div>
            </div>
        )
    }
}

class AddCondition extends Component {

    constructor () {
        super()
        this.state = {
            currency: null,
            condition: LESS_OR_EQUAL,
            amount: null
        }
    }

    onCurrencyChange (e) {
        this.setState({
            currency: e.target.value
        })
    }

    onConditionChange (e) {
        this.setState({
            condition: e.target.value
        })
    }

    onAmountChange (e) {
        this.setState({
            amount: e.target.value
        })
    }

    onSave () {
        const notificationCondition = {
            currency: this.state.currency,
            condition: this.state.condition,
            value: parseFloat(this.state.amount),
            off: false
        }
    
        chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
            chrome.storage.local.set({
                [NOTIFICATION_CONDITIONS_STORAGE_KEY]: notificationConditions.concat(notificationCondition)
            })
        })

        this.props.onAddedNewCondition(notificationCondition)
    }

    render () {
        return (
            <div className='add-condition'>
                <div className='add-condition__column'>
                    <label>Currency</label>
                    <input onChange={e => this.onCurrencyChange(e)} />
                </div>

                <div className='add-condition__column'>
                    <label>Condition</label>
                    <select defaultValue={LESS_OR_EQUAL} onChange={e => this.onConditionChange(e)}>
                        <option value={LESS_OR_EQUAL}>{LESS_OR_EQUAL}</option>
                        <option value='>='>{'>='}</option>
                        <option value='<'>{'<'}</option>
                        <option value='>'>{'>'}</option>
                    </select>
                </div>

                <div className='add-condition__column'>
                    <label>Amount</label>
                    <input onChange={e => this.onAmountChange(e)} />
                </div>

                <div className='add-condition__column'>
                    <button className='add-condition__column__save-button' onClick={e => this.onSave(e)}>Save</button>
                </div>
            </div>
        )
    }
}

class App extends Component {
    constructor () {
        super()
        this.state = {
            conditionsList: []
        }
    }

    componentDidMount () {
        this.loadExistingNotificationConditions()
        .then(notificationConditions => {
            this.setState({
                conditionsList: notificationConditions
            })
        })
    }

    loadExistingNotificationConditions () {
        const notificationConditionsDiv = document.getElementById('notification-conditions')
    
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(
                NOTIFICATION_CONDITIONS_STORAGE_KEY, 
                ({notificationConditions}) => resolve(notificationConditions)
            )
        })
    }

    onAddCondition (condition) {
        this.state.conditionsList.push(condition)
        this.setState({
            conditionsList: this.state.conditionsList
        })
    }

    clearConditions () {
        chrome.storage.local.set({
            [NOTIFICATION_CONDITIONS_STORAGE_KEY]: []
        })
        this.setState({
            conditionsList: []
        })
    }

    render () {
        return (
            <div>
                <h1>Bittrex Notifications</h1>

                <NotificationConditionsList 
                    conditionsList={this.state.conditionsList} 
                    clearConditions={_ => this.clearConditions()} />

                <AddCondition 
                    onAddedNewCondition={condition => this.onAddCondition(condition)} />
            </div>
        )
    }
}

document.addEventListener('DOMContentLoaded', _ => {
    ReactDOM.render(<App />, document.getElementById('app'))
})
