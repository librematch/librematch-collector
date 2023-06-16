import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';

// @Plugin()
// export class LoggingPlugin implements ApolloServerPlugin {
//   requestDidStart(): GraphQLRequestListener {
//
//     const operationName = requestContext.request.operationName;
//     if (operationName === 'IntrospectionQuery') return;
//     return new BasicLoggingListener();
//
//     return {
//       willSendResponse() {
//         console.log('Will send response');
//       },
//     };
//   }
// }

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
    async requestDidStart(requestContext: any): Promise<GraphQLRequestListener> {
        console.log('Request started', requestContext.context?.req?.client?.remoteAddress, requestContext.context?.req?.headers['x-forwarded-for']);

        const operationName = requestContext.request.operationName;
        if (operationName === 'IntrospectionQuery') return;
        return new BasicLoggingListener();

        // return {
        //     async willSendResponse() {
        //
        //         console.log('Will send responseee');
        //     },
        // };
    }
}


// @Plugin()
// export class LoggingPlugin implements ApolloServerPlugin {
//   requestDidStart?(requestContext: any): GraphQLRequestListener {
//     const operationName = requestContext.request.operationName;
//     if (operationName === 'IntrospectionQuery') return;
//     return new BasicLoggingListener();
//   }
//   [key: string]: any;
// }

class BasicLoggingListener implements GraphQLRequestListener {

   async willSendResponse(requestContext: any) {
     const tracing = requestContext.response.extensions?.['tracing'];
     if (tracing == null) return;
     const durationNs = tracing.duration;
     const durationMs = durationNs / 1000 / 1000;
     const operationName = requestContext.request.operationName;
     console.log();
     console.log(operationName);
     console.log(durationMs + 'ms');
  }

  [key: string]: import("apollo-server-types").AnyFunction

  // didResolveSource?(requestContext: GraphQLRequestContextDidResolveSource<BaseContext>) {}
  // parsingDidStart?(requestContext: GraphQLRequestContextParsingDidStart<BaseContext>) {}
  // validationDidStart?(requestContext: GraphQLRequestContextValidationDidStart<BaseContext>) {}
  // didResolveOperation?(requestContext: GraphQLRequestContextDidResolveOperation<BaseContext>) {}
  // didEncounterErrors?(requestContext: GraphQLRequestContextDidEncounterErrors<BaseContext>) {}

  // responseForOperation(requestContext: GraphQLRequestContextResponseForOperation<BaseContext>) { return null; }
  // executionDidStart(requestContext: GraphQLRequestContextExecutionDidStart<BaseContext>) {}
}