import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid/v1'

import { 
    add as addNotificationCondition, 
    all as loadNotificationConditions,
    removeAll as removeAllNotificationConditions
} from './repositories/notifications'

const LESS_OR_EQUAL = '<='

class NotificationConditionsList extends Component {
    render () {
        return (
            <div className='notifications-list'>
                <div className='notifications-list__header'>
                    <h2>Notifications</h2>
                    { 
                        this.props.conditionsList && this.props.conditionsList.length
                        ?
                            <div className='notifications-list__clear-button-container'>
                                <a href='#' className='notifications-list__clear-button-container__button' onClick={_ => this.props.clearConditions()}>
                                    <div className='close icon'></div>
                                    <span className='notifications-list__clear-button-container__button__label'>Remove All</span>
                                </a>
                            </div>
                        : null
                    }
                </div>

                <div className='notifications-list__list'>
                {
                    this.props.conditionsList 
                    ? this.props.conditionsList
                        .sort(n => n.off)
                        .map(
                        c => (
                            <div className='notifications-list__list__item' key={uuid()}>
                                <span className={
                                    c.off 
                                    ? 'notifications-list__list__item__text notifications-list__list__item__text--inactive' 
                                    : 'notifications-list__list__item__text'
                                }>
                                    {c.currency} {c.condition} {c.value}
                                </span>
                            </div>
                        )
                    )
                    : null
                }
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
    
        addNotificationCondition(notificationCondition)

        this.props.onAddedNewCondition(notificationCondition)
    }

    render () {
        return (
            <div className='add-condition'>
                <h2 className='add-condition__header'>Add notification</h2>

                <div className='add-condition__content'>
                    <div className='add-condition__column'>
                        <label className='add-condition__column__label'>Currency</label>
                        <input onChange={e => this.onCurrencyChange(e)} />
                    </div>

                    <div className='add-condition__column'>
                        <label className='add-condition__column__label'>Condition</label>
                        <select defaultValue={LESS_OR_EQUAL} onChange={e => this.onConditionChange(e)}>
                            <option value={LESS_OR_EQUAL}>{LESS_OR_EQUAL}</option>
                            <option value='>='>{'>='}</option>
                            <option value='<'>{'<'}</option>
                            <option value='>'>{'>'}</option>
                        </select>
                    </div>

                    <div className='add-condition__column'>
                        <label className='add-condition__column__label'>Amount</label>
                        <input onChange={e => this.onAmountChange(e)} />
                    </div>

                    <div className='add-condition__column add-condition__column__save-button'>
                        <a href='#' className='add-condition__column__save-button__button' onClick={e => this.onSave(e)}>
                            <div className='check icon'></div>
                            <span className='add-condition__column__save-button__button__label'>Save</span>
                        </a>
                    </div>
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
    
        return new Promise((resolve, reject) => loadNotificationConditions(resolve))
    }

    onAddCondition (condition) {
        this.state.conditionsList.push(condition)
        this.setState({
            conditionsList: this.state.conditionsList
        })
    }

    clearConditions () {
        removeAllNotificationConditions()
        this.setState({
            conditionsList: []
        })
    }

    render () {
        return (
            <div>
                <header>
                    <h1>Bittrex Uatu</h1>
                </header>

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
