const canMerge = (o, n) => {
    if (o == null || typeof o !== 'object') return false
    if (n == null || typeof n !== 'object') return false
    return true
}

const merge = (o, n) => {
    if (!canMerge(o, n)) {
        return n
    }

    // we support shallow merge only
    return Object.assign({}, o, n)
}

const expectOwner = context => {
    console.log(context.deployedBy, context.runtime.msg.sender)
    if (context.runtime.msg.sender !== context.deployedBy) {
        throw new Error('Permission denied.')
    }
}

module.exports = context => {
    function exportState() {
        return context.getStateKeys().reduce((data, key) => {
            data[key] = context.getState(key)
            return data
        }, {})
    }

    function importState(data, overwrite) {
        expectOwner(context)
        Object.entries(data).forEach(([key, value]) => {
            if (overwrite) {
                context.setState(key, value)
            } else {
                const old = context.getState(key)
                context.setState(key, merge(old, value))
            }
        })
    }

    function migrateState(fromContract, overwrite) {
        const c = context.runtime.loadContract(fromContract)
        const data = c.exportState.invokeView()
        console.log(data)
        if (data && typeof data == 'object') {
            importState(data, overwrite)
        }
    }

    return { exportState, importState, migrateState }
}