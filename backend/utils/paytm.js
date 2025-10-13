// backend/utils/paytm.js

// WARNING: These are MOCK checksum functions for development. 
// For real integration, you MUST use the official Paytm SDK or checksum library 
// to ensure security and compliance.

const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_MID = process.env.PAYTM_MID;
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE;

// Placeholder for the actual Paytm SDK functions
const checksum = {
    generateSignature: (params, key) => {
        console.log('--- MOCK: Generating Paytm Checksum ---');
        // This MUST be replaced by the actual checksum algorithm
        return "MOCK_CHECKSUM_GENERATED_" + new Date().getTime(); 
    },
    verifySignature: (params, key, checksum) => {
        console.log('--- MOCK: Verifying Paytm Checksum ---');
        // This MUST be replaced by the actual checksum verification algorithm
        return true; // Always return true for sandbox testing simplicity
    }
};

/**
 * Prepares transaction parameters for checksum generation.
 */
const prepareTransactionParams = (txnParams) => {
    return {
        MID: PAYTM_MID,
        WEBSITE: PAYTM_WEBSITE,
        CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
        INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID,
        ORDER_ID: txnParams.ORDER_ID,
        CUST_ID: String(txnParams.user_id),
        TXN_AMOUNT: String(txnParams.amount.toFixed(2)),
        CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
        // Pass essential data through the gateway
        course_id: String(txnParams.course_id)
    };
};

/**
 * Generates the Paytm checksum and returns all required parameters.
 */
const generatePaytmChecksum = (txnParams) => {
    const params = prepareTransactionParams(txnParams);
    const signature = checksum.generateSignature(params, PAYTM_MERCHANT_KEY);
    return { ...params, CHECKSUMHASH: signature };
};

/**
 * Verifies the checksum received in the Paytm callback.
 */
const verifyPaytmChecksum = (receivedParams) => {
    // Note: We create a copy because the verify function often mutates the object
    const paramsWithoutChecksum = { ...receivedParams };
    const checksumHash = receivedParams.CHECKSUMHASH;
    delete paramsWithoutChecksum.CHECKSUMHASH;
    
    return checksum.verifySignature(paramsWithoutChecksum, PAYTM_MERCHANT_KEY, checksumHash);
};


module.exports = {
    generatePaytmChecksum,
    verifyPaytmChecksum
};