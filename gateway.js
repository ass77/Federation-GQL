const {ApolloServer} = require('apollo-server')
const {ApolloGateway, RemoteGraphQLDataSource} = require('@apollo/gateway')
require('dotenv').config()

const astraToken = process.env.REACT_APP_ASTRA_TOKEN

class StargateGraphQLDataSource extends RemoteGraphQLDataSource {
    willSendRequest({request, context}) {
        request.http.headers.set('x-cassandra-token', astraToken)
    }
}

const gateway = new ApolloGateway({
        serviceList: [
            {
                name: 'coins',
                url: 'https://3dba3217-2852-4d62-84da-e260c088c7c8-ap-southeast-1.apps.astra.datastax.com/api/graphql/koins'
            },
            {
                name: 'deals',
                url: 'http://localhost:4001/graphql'
            }
        ],

        introspectionHeaders: {
            'x-cassandra-token': astraToken,
        },

        buildService({name, url}) {
            if (name == 'koins') {
                return new StargateGraphQLDataSource({url})
            } else {
                return new RemoteGraphQLDataSource({url})
            }
        },
        __exposeQueryPlanExperimental: true,
    })

;(async () => {
    const server = new ApolloServer({
        gateway,
        engine: false,
        subscriptions: false,
    })

    server.listen().then(({url}) => {
        console.log(`🚀 Gateway ready at ${url}`)
    })
})()



