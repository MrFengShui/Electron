import * as crypto from 'jsencrypt';
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {storage} from "../ngrx/storage.reducer";

type PublicPrivateKeyType = {pubKey: string, priKey: string};

@Injectable({
    providedIn: 'root'
})
export class LoginInfoCryptoService {

    private tool: crypto.JSEncrypt = new crypto.JSEncrypt();

    constructor(private _http: HttpClient) {
    }

    public encrypt(info: any): Observable<string | false> {
        return this._http.get<PublicPrivateKeyType>('assets/rsa-key.json', {responseType: 'json'})
            .pipe(map(value => {
                this.tool.setPublicKey(value.pubKey);
                return this.tool.encrypt(JSON.stringify(info));
            }));
    }

    public decrypt(): Observable<string | false> {
        return this._http.get<PublicPrivateKeyType>('assets/rsa-key.json', {responseType: 'json'})
            .pipe(map(value => {
                let token: string | null = storage.getItem('token');
                this.tool.setPrivateKey(value.priKey);
                return token === null ? false : this.tool.decrypt(token);
            }));
    }

}
