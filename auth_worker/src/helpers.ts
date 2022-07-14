function jsonResponseDefaultOptions(): ResponseInit {
    return {
        headers: {
            'content-type': 'application/json;charset=UTF-8'
        }
    }
}

export { jsonResponseDefaultOptions }