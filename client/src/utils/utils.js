export const ensureGuid = (id) => {
        const clean = id.replace(/[{}-]/g, '').trim().toLowerCase();
        return clean.replace(/^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/, '$1-$2-$3-$4-$5');
    }