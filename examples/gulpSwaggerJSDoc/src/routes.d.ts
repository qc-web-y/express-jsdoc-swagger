/**
 * POST /accounts/create
 * @summary Create Accounts
 * @tags Accounts
 * @security BearerAuth
 * @param {AccountCreateItemReq} request.body.required - request body - application/x-www-form-urlencoded
 * @return {AccountCreateItemRes} 200 - successful
 */
/** request body
 * @typedef {object} AccountCreateItemReq
 * @property {string} title.required - accounts title
 * @property {string} description - accounts description
 */
/** resqust body
 * @typedef {object} AccountCreateItemRes
 * @property {string} id.required - accounts id
 */
