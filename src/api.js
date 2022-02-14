const API_KEY = '95ccb277261609b4eb7de1dd6f6f50f255522550d5c35d7de3fa78ad9ed61e32'

const tickersHandlers = new Map()
const prices = new Map()
const AGGREGATE_INDEX = '5'
let priceBTC
const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)

tickersHandlers.set('BTC', [])
subscribeToTickerOnWS('BTC', 'USD')


socket.addEventListener('message', e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)

    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return
    }

    updatePriceBTC(currency, newPrice)


    if (currency !== 'BTC' && priceBTC !== undefined) {
        prices.set(currency, newPrice)
        const handlers = tickersHandlers.get(currency) || []
        handlers.forEach(fn => fn(newPrice * priceBTC))
        return
    }


    for (let tickerName of tickersHandlers.keys()) {
        const handlers = tickersHandlers.get(tickerName) || []
        if (tickerName === 'BTC') {
            handlers.forEach(fn => fn(priceBTC))
            return
        }

        const oldPrice = prices.get(tickerName)
        handlers.forEach(fn => fn(oldPrice * priceBTC))
    }
})

function updatePriceBTC(currency, newPrice) {
    if (currency === 'BTC') {
        priceBTC = newPrice
    }
}


function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message)
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage)
        return
    }

    socket.addEventListener('open', () => {
        socket.send(stringifiedMessage)
    }, {once: true})
}

function subscribeToTickerOnWS(ticker, type) {
    sendToWebSocket(
        {
            'action': 'SubAdd',
            'subs': [`${AGGREGATE_INDEX}~CCCAGG~${ticker}~${type}`]
        }
    )
}

function unsubscribeFromTickersOnWS(ticker, type) {
    sendToWebSocket(
        {
            'action': 'SubRemove',
            'subs': [`${AGGREGATE_INDEX}~CCCAGG~${ticker}~${type}`]
        }
    )
}

export const subscribeToTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
    prices.set(ticker, '')
    if (ticker === 'BTC') {
        return
    } else {
        subscribeToTickerOnWS(ticker, 'BTC')
    }
}

export const unsubscribeFromTicker = (ticker) => {
    if (ticker === 'BTC') {
        return
    }
    tickersHandlers.delete(ticker)
    unsubscribeFromTickersOnWS(ticker, 'BTC')
}