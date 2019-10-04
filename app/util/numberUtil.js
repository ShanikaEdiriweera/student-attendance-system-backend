module.exports = {
    /**
     * Generate a unique pin with given length
     * Used for ideamart pin
     * char set - ambiguous characters removed 
     */
    generatePin: (length) => {
        let result = '';
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; // removed - I, O, i, l, o, 0, 1
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}