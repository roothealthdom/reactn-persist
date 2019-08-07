import { setGlobal, getGlobal, addCallback } from 'reactn';
import { debounce } from './helpers';

const defaults = {
	KEY: '@reactn',
	whitelist: [],
	debounceDelay: 1000,
	debug: false,
}

const log = (method, payload) => {
	console.log('reactn-persist: ', method, payload);
};

const rehidrate = async ({ storage, key, debug }) => {
	try {
		const persistedGlobalValue = await storage.getItem(key);
		const persistedGlobal = JSON.parse(persistedGlobalValue);
		const global = getGlobal();
		setGlobal({ ...global, ...persistedGlobal });
		debug && log('rehidrate', { initial: { ...global }, persisted: { ...persistedGlobal } });
	} catch (error) {
		debug && log('rehidrate', { error: error.message });
	}
};

const parsePerisistableGlobal = (global, { whitelist }) => {
	return Object.keys(global).reduce((persistedGlobal, key) => {
		if (whitelist.includes(key)) {
			persistedGlobal[key] = global[key];
		}
		return persistedGlobal;
	}, Object.create(null))
}

const persist = ({ storage, key, whitelist, debug }) => global => {
	try {
		const persistedGlobal = whitelist.length ? parsePerisistableGlobal(global, { whitelist }) : global;
		const persistedGlobalValue = JSON.stringify(persistedGlobal);
		storage.setItem(key, persistedGlobalValue);
		debug && log('persist', { key, value: persistedGlobalValue });
	} catch (error) {
		debug && log('persist', { error: error.message });
	}
};

const init = async ({ storage, key = defaults.KEY, whitelist = defaults.whitelist, debounceDelay = defaults.debounceDelay, debug = defaults.debug }) => {
	try {
		await rehidrate({ storage, key });
		const debouncedPersist = debounce(persist({ storage, key, whitelist }), debounceDelay);
		addCallback(debouncedPersist);
		debug && log('init', { success: true });
	} catch (error) {
		debug && log('init', { error: error.message });
	}
};

export default init;