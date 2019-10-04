import axios from 'axios';
import { IDEAMART_SERVER } from '../constants';
import winston from '../../config/winston';

const BASE_URL = IDEAMART_SERVER.BASE_URL;

// const config = {
//   headers: {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
//   }
// };
// .get(url, config)
// .post(url, jsonBody, config)

export default class HttpUtil {
    static async getRequest(endPoint, jsonBody, jwtToken = null) {
        let url = BASE_URL + endPoint;
        winston.info('[HTTP][GET][REQUEST] ' + endPoint);
        return axios
            .get(url)
            .then(response => {
                winston.info('[HTTP][GET][SUCCESS] ' + endPoint); // new Date().toUTCString()
                return response.data;
            })
            .catch(error => {
                winston.error('[HTTP][GET][ERROR] ' + endPoint);
                throw error;
            });
    }

    static async postRequest(endPoint, jsonBody, jwtToken = null) {
        let url = BASE_URL + endPoint;
        winston.info('[HTTP][POST][REQUEST] ' + endPoint);
        return axios
            .post(url, jsonBody)
            .then(function(response) {
                winston.info('[HTTP][POST][SUCCESS] ' + endPoint);
                return response.data;
            })
            .catch(function(error) {
                winston.error('[HTTP][POST][ERROR] ' + endPoint);
                return error;
            });
    }
}

// ----- TO-DO -----
// getRequestWithParams
// vs
// getRequest(endPoint, jsonBody, jwtToken, params) & .getRequest(/s,null,null,param) and handle

// if token add     Else dont add

// errorHandling

// constructor      ->      new
// CONFIG           ->      static methods
// extends Service  ->      with socket

// static getRequest        async?

// https://gist.github.com/paulsturgess/ebfae1d1ac1779f18487d3dee80d1258
// https://gist.github.com/sheharyarn/7f43ef98c5363a34652e60259370d2cb
// https://gist.github.com/wesbos/1866f918824936ffb73d8fd0b02879b4

// https://github.com/matthew-andrews/isomorphic-fetch
// https://github.com/axios/axios#promises
// https://github.com/axios/moxios
