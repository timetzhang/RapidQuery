/**
 * RapidQuery Main
 * by Timet Zhang
 */

module.exports = async(ctx, next) => {
    if (ctx.method === 'POST') {
        try {
            if (ctx.request.body.query) {
                this.query(JSON.parse(ctx.request.body.query)).then(data => {
                    ctx.body = data;
                })
            }
            await next()
        } catch (err) {
            ctx.status = 400
            ctx.body = `oH-Ho: ${err.message}`
            console.log('RapidQuery Error:', err.message)
        }
    }
};