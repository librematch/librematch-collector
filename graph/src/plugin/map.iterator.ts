import {$$asyncIterator} from "iterall";

// https://github.com/apollographql/graphql-subscriptions/blob/master/README.md#custom-asynciterator-wrappers
export function mapIterator<T>(asyncIterator: AsyncIterator<T>, callback: any) {
    const getNextPromise = () => {
        return new Promise<IteratorResult<any>>((resolve, reject) => {
            const inner = () => {
                asyncIterator
                    .next()
                    .then(payload => {
                        if (payload.done === true) {
                            resolve(payload);
                            return;
                        }

                        // console.log('map payload', payload);

                        payload.value = callback(payload.value);
                        resolve(payload);
                    })
                    .catch((err) => {
                        reject(err);
                        return;
                    });
            };

            inner();

        });
    };
    return {
        next() {
            return getNextPromise();
        },
        return() {
            return asyncIterator.return();
        },
        throw(error) {
            return asyncIterator.throw(error);
        },
        [$$asyncIterator]() {
            return this;
        },
    }
}
