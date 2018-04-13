
console.log(_classes);

// define the dimensions of the visualization

var width = 800,
    height = 800;

// we'll also define a variable that specifies the duration
// of each animation step (in milliseconds).

var animationStep = 20;

// next define the main object for the layout. we'll also
// define a couple of objects to keep track of the d3 selections
// for the nodes and the links. all of these objects are
// initialized later on.

var force = null,
    nodes = null,
    links = null;

// we can also create the svg container that will hold the 
// visualization. d3 makes it easy to set this container's
// dimensions and add it to the DOM.

var svg = d3.select('body').append('svg')
    .attr('width',width)
    .attr('height',height);

// now we'll define a few helper functions. you might not
// need to make these named function in a typical visualization,
// but they'll make it easy to control the visualization in
// this case.

// first is a function to initialize or visualization.

var initForce = function() {
    
    // before we do anything else, we clear out the contents
    // of the svg container. this step makes it possible to
    // restart the layout without refreshing the page.
    
    svg.selectAll('*').remove();
    
    // define the data for the example. in general, a force layout
    // requires two data arrays. the first array, here named 'nodes',
    // contains the objects that are the focal points of the visualization.
    // the second array, called 'links' below, identifes all the links
    // between the nodes. (The more mathematical term is "edges".)
    
    // As far as D3 is concerned, nodes are arbitrary objects.
    // Normally the objects wouldn't be initialized with `x` and `y`
    // properties like we're doing below. When those properties are
    // present, they tell D3 where to place the nodes before the force
    // layout starts its magic. More typically, they're left out of the
    // nodes and D3 picks random locations for each node. We're defining
    // them here so we can get a consistent application of the layout
    
    var dataNodes = _classes.map((e,idx) => {
        
        if (idx % 2 === 0) {
            e['x'] = (idx + 1) * (width/9);
            e['y'] = 80;
        } else {
            e['x'] = 90;
            e['y'] = ((height * (idx + 1)) / _classes.length);
        }
        
        return e;
    });
    
    // the 'links' array contains objects with a 'source' and a 'target'
    // property. the values of those properties are the indices in
    // the 'nodes' array of the two endpoints of the link. our links
    // bind the first two nodes into one graph and the next two nodes
    // into the second graph.
    
    var dataLinks = [];
    
    _classes.map((e,idx) => {
        
        let links = e['DD_Association'];

        links.map(i => {
            let lid = i['local_identifier'][0];

            // search for lid in dataNodes array
            let match = dataNodes.find(el => el['local_identifier'][0] === lid );
            if (match) dataLinks.push({ source: idx, target: dataNodes.indexOf(match) });
        });
        
    });
    
    // now we create a force layout object and define its properties.
    // those include the dimensions of the visualization and the arrays
    // of nodes and links.
    
    force = d3.layout.force()
        .size([width,height])
        .nodes(dataNodes)
        .links(dataLinks);
    
    // to keep the nodes centered in the visualization we increase
    // the 'gravity' a bit more than its default value of '0.1'. we'll
    // explore this property in more detail in another example.
    
    force.gravity(0.2);
    
    // define the 'linkDistance' for the graph. this is the
    // distance we desire between connected nodes.
    
    force.linkDistance(height/4);
    
    // here's the part where things get interesting. because
    // we're looking at the `charge` property, that's what we
    // want to vary between the read and blue nodes. Most often
    // this property is set to a constant value for an entire
    // visualization, but D3 also lets us define it as a function.
    // When we do that, we can set a different value for each node.

    // Negative charge values indicate repulsion, which is generally
    // desirable for force-directed graphs. (Positive values indicate
    // attraction and can be helpful for other visualization types.)
    
    force.charge(function(node) {
        if (node.className === 'red') return -3000;
        return -30;
    });
    
    // Next we'll add the nodes and links to the visualization.
    // Note that we're just sticking them into the SVG container
    // at this point. We start with the links. The order here is
    // important because we want the nodes to appear "on top of"
    // the links. SVG doesn't really have a convenient equivalent
    // to HTML's `z-index`; instead it relies on the order of the
    // elements in the markup. By adding the nodes _after_ the
    // links we ensure that nodes appear on top of links.

    // Links are pretty simple. They're just SVG lines. We're going
    // to position the lines according to the centers of their
    // source and target nodes. You'll note that the `source`
    // and `target` properties are indices into the `nodes`
    // array. That's how our data is structured and that's how
    // D3's force layout expects its inputs. As soon as the layout
    // begins executing, however, it's going to replace those
    // properties with references to the actual node objects
    // instead of indices.
    
    links = svg.selectAll('.link')
        .data(dataLinks)
        .enter().append('line')
        .attr('class','link')
        .attr('x1', function(d) { return dataNodes[d.source].x;  })
        .attr('y1', function(d) { return dataNodes[d.source].y;  })
        .attr('x2', function(d) { return dataNodes[d.target].x;  })
        .attr('y2', function(d) { return dataNodes[d.target].y;  });
    
    // Now it's the nodes turn. Each node is drawn as a circle and
    // given a radius and initial position within the SVG container.
    // As is normal with SVG circles, the position is specified by
    // the `cx` and `cy` attributes, which define the center of the
    // circle. We actually don't have to position the nodes to start
    // off, as the force layout is going to immediately move them.
    // But this makes it a little easier to see what's going on
    // before we start the layout executing.
    
    nodes = svg.selectAll('.node')
        .data(dataNodes)
        .enter();
    nodes
        .append('circle')
        .attr('class','node')
        .attr('r', width/25)
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    nodes
        .append('text')
        .attr('x',function(d) { return d.x; })
        .attr('y',function(d) { return d.y; })
        .text(function(d) { return d.name[0]; });
    
    // if we've defined a class name for a node, add it to the
    // element. we'll use the d3 'each' function to iterate
    // through the selection. the parameter passed to that
    // function is the data object associated with the
    // selection which, by convention, is parameterized as 'd'.
    // in our case that will be the node object.
    
    // also in the 'each' function, the context ('this') is
    // set to the associated node in the DOM.

    nodes = svg.selectAll('.node');

    svg.selectAll('.node').each(function(d) {
        if (d.className) {
            d3.select(this).classed(d.className, true);
        }
    });
    
    // finally we tell d3 that we want it to call the step
    // function at each iteration.
    
    force.on('tick', stepForce);
    
};

// the next function is the event handler that will execute
// at each iteration of the layout.

var stepForce = function() {
    
    // when this function executes, the force layout
    // calculations have been updated. the layout will
    // have set variuous properties in our nodes and
    // links objects that we can use to position them
    // within the svg container.
    
    // First let's reposition the nodes. As the force
    // layout runs it updates the `x` and `y` properties
    // that define where the node should be centered.
    // To move the node, we set the appropriate SVG
    // attributes to their new values.

    // The code here differs depending on whether or
    // not we're running the layout at full speed.
    // In full speed we simply set the new positions.
    
    if (force.fullSpeed) {
        
        nodes
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
        
        // otherwise, we use a transition to move them to
        // their positions instead of simply setting the
        // values abruptly.
        
    } else {
        
        nodes.transition().ease('linear').duration(animationStep)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }
    
    // We also need to update positions of the links.
    // For those elements, the force layout sets the
    // `source` and `target` properties, specifying
    // `x` and `y` values in each case.

    // Here's where you can see how the force layout has
    // changed the `source` and `target` properties of
    // the links. Now that the layout has executed at least
    // one iteration, the indices have been replaced by
    // references to the node objects.

    // As with the nodes, at full speed we don't use any
    // transitions.
    
    if (force.fullSpeed) {
        
        links
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });
            
    } else {
        
        links.transition().ease('linear').duration(animationStep)
            .attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });
    }
    
    // unless the layout is operating at normal speed, we
    // only want to show one step at a time.
    
    if (!force.fullSpeed) {
        force.stop();
    }
    
    // if we're animating the layout in slow motion, continue
    // after a delay to allow the animation to take effect.
    
    if (force.slowMotion) {
        setTimeout(
            function() { force.start(); },
            animationStep
        );
    }
}

// now let's take care of the user interaction controls.
// we'll add functions to respond to clicks on the individual
// buttons.

// when the user clicks on the "Advance" button, we
// start the force layout (the tick handler will stop
// the layout after one iteration.)

d3.select('#advance').on('click', function() {
    
    force.start();
    
});

// when the user clicks on the "Slow Motion" button, we're
// going to run the force layout until it concludes.

d3.select('#slow').on('click', function() {
    
    // indicate that the animation is in progress.
    
    force.slowMotion = true;
    force.fullSpeed = false;
    
    // start the animation
    
    force.start();
    
});

// when the user clicks on the "Reset" button, we'll
// start the whole process over again.

d3.select('#reset').on('click', function() {
    
    // if we've already started the layout, stop it.
    if (force) {
        force.stop();
    }
    
    // re-initialize to start over again.
    
    initForce();
    
});

// now we can initialize the force layout so that it's ready
// to run.

initForce();
