// SPDX-License-Identifier: AGPL-3.0-or-later

import { $$asyncIterator } from "iterall";

// https://github.com/apollographql/graphql-subscriptions/blob/master/README.md#custom-asynciterator-wrappers
export function prefillIterator<T>(asyncIterator: AsyncIterator<T>, items: any[]) {
    let i = 0;
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

                        // console.log('payload', payload);

                        // payload.value = items(payload.value);
                        resolve(payload);
                    })
                    .catch((err) => {
                        reject(err);
                        return;
                    });
            };

            if (i < items.length) {
                console.log('i', i);
                resolve({
                    done: false,// i == items.length - 1,
                    value: items[i++],
                });
                return;
            }

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
