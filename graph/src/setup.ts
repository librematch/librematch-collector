// SPDX-License-Identifier: AGPL-3.0-or-later

// Imports
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { Resource } from '@opentelemetry/resources'
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks'
import * as api from '@opentelemetry/api'

export function setupTracing() {
    // const contextManager = new AsyncHooksContextManager().enable()
    //
    // api.context.setGlobalContextManager(contextManager)
    //
    // //Configure the console exporter
    // const consoleExporter = new ConsoleSpanExporter()
    //
    // // Configure the trace provider
    // const provider = new BasicTracerProvider({
    //     resource: new Resource({
    //         [SemanticResourceAttributes.SERVICE_NAME]: 'test-tracing-service',
    //         [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    //     }),
    // })
    //
    // // Configure how spans are processed and exported. In this case we're sending spans
    // // as we receive them to the console
    // provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter))
    //
    // // Register your auto-instrumentors
    // registerInstrumentations({
    //     tracerProvider: provider,
    //     instrumentations: [new PrismaInstrumentation()],
    // })
    //
    // // Register the provider
    // provider.register()

    // Configure the trace provider
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: 'example application',
        }),
    })

    // Configure how spans are processed and exported. In this case we're sending spans
    // as we receive them to an OTLP-compatible collector (e.g. Jaeger).
    provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()))

    // Register your auto-instrumentors
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [new PrismaInstrumentation()],
    })

    // Register the provider globally
    provider.register();
}