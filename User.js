export default class User {
    constructor(name) {
        this._name = name;
    }

    hashPassword() {

    }

    isConnected() {
        return true;
    }

    hasPermission() {
        return true;
    }
}