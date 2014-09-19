previousFragment = null

class Hub extends Backbone.Router
    initialize: (options) ->
        routeSpec = ''

        @components = options.components
        @routeParams = {}

        for component, elements of @components
            routeSpec += "(#{component}/:#{elements.join('/:')})(/)"
            for element in elements
                @routeParams[element] = component

        @route routeSpec, 'component', @broadcast
        return

    broadcast: (params...) ->
        routeParts = (component for component of @routeParams)
        targetComponents = {}

        for index, param of params
            paramName = routeParts[index]
            targetComponent = @routeParams[paramName]
            target

            if param
                if not targetComponents[targetComponent]
                    target = targetComponents[targetComponent] = {}
                else
                    target = targetComponents[targetComponent]

                target[paramName] = param

        for component, elements of targetComponents
            @trigger "#{component}-route-fired", elements

        return

app.Hub = Hub
