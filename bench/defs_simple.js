var justtext_def =
  function(edge, source, target, context, settings) {

  if (typeof edge.label !== 'string' || source == target)
    return;

  var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

  if (size < settings('edgeLabelThreshold') && !edge.hover)
    return;

  var fontSize,
      angle = 0,
      x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
      y = (source[prefix + 'y'] + target[prefix + 'y']) / 2;

  context.fillText(
    edge.label,
    x,
    (-size / 2) - 3 + y
  );
};


var textangle_def =
  function(edge, source, target, context, settings) {

  if (typeof edge.label !== 'string' || source == target)
    return;

  var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

  if (size < settings('edgeLabelThreshold') && !edge.hover)
    return;

  var fontSize,
      angle = 0,
      x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
      y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
      dX = target[prefix + 'x'] - source[prefix + 'x'],
      dY = target[prefix + 'y'] - source[prefix + 'y'],
      sign = (source[prefix + 'x'] < target[prefix + 'x']) ? 1 : -1;

  angle = Math.atan2(dY * sign, dX * sign);
  context.translate(x,y);
  context.rotate(angle);
  context.fillText(
    edge.label,
    0,
    (-size / 2) - 3
  );
  context.rotate(-angle);
  context.translate(-x,-y);
};

var textangle_save_def =
  function(edge, source, target, context, settings) {

  if (typeof edge.label !== 'string' || source == target)
    return;

  var prefix = settings('prefix') || '',
      size = edge[prefix + 'size'] || 1;

  if (size < settings('edgeLabelThreshold') && !edge.hover)
    return;

  var fontSize,
      angle = 0,
      x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
      y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
      dX = target[prefix + 'x'] - source[prefix + 'x'],
      dY = target[prefix + 'y'] - source[prefix + 'y'],
      sign = (source[prefix + 'x'] < target[prefix + 'x']) ? 1 : -1;

  context.save();
  angle = Math.atan2(dY * sign, dX * sign);
  context.translate(x,y);
  context.rotate(angle);
  context.fillText(
    edge.label,
    0,
    (-size / 2) - 3
  );
  context.restore();
};

var force_aligned_def = function(edge, source, target, context, settings) {
    if (typeof edge.label !== 'string' || source == target)
      return;

    var prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1;

    if (size < settings('edgeLabelThreshold') && !edge.hover)
      return;

    if (0 === settings('edgeLabelSizePowRatio'))
      throw new Error('Invalid setting: "edgeLabelSizePowRatio" is equal to 0.');

    var fontSize,
        angle = 0,
        fontStyle = edge.hover ?
          (settings('hoverFontStyle') || settings('fontStyle')) :
          settings('fontStyle'),
        x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
        y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
        dX = target[prefix + 'x'] - source[prefix + 'x'],
        dY = target[prefix + 'y'] - source[prefix + 'y'],
        sign = (source[prefix + 'x'] < target[prefix + 'x']) ? 1 : -1;

    // The font size is sublineraly proportional to the edge size, in order to
    // avoid very large labels on screen.
    // This is achieved by f(x) = x * x^(-1/ a), where 'x' is the size and 'a'
    // is the edgeLabelSizePowRatio. Notice that f(1) = 1.
    // The final form is:
    // f'(x) = b * x * x^(-1 / a), thus f'(1) = b. Application:
    // fontSize = defaultEdgeLabelSize if edgeLabelSizePowRatio = 1
    fontSize = (settings('edgeLabelSize') === 'fixed') ?
      settings('defaultEdgeLabelSize') :
      settings('defaultEdgeLabelSize') *
      size *
      Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

    context.save();

    if (edge.active) {
      context.font = [
        settings('activeFontStyle') || settings('fontStyle'),
        fontSize + 'px',
        settings('activeFont') || settings('font')
      ].join(' ');
    }
    else {
      context.font = [
        fontStyle,
        fontSize + 'px',
        settings('font')
      ].join(' ');
    }

    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    // force horizontal alignment if not enough space to draw the text,
    // otherwise draw text along the edge line:
    if ('auto' === settings('edgeLabelAlignment')) {
      angle = Math.atan2(dY * sign, dX * sign);
    }

    if (edge.hover) {
      // Label background:
      context.fillStyle = settings('edgeLabelHoverBGColor') === 'edge' ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeHoverLabelBGColor');

      if (settings('edgeLabelHoverShadow')) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 8;
        context.shadowColor = settings('edgeLabelHoverShadowColor');
      }

      drawBackground(angle, context, fontSize, size, edge.label, x, y);

      if (settings('edgeLabelHoverShadow')) {
        context.shadowBlur = 0;
        context.shadowColor = '#000';
      }
    }

    if (edge.active) {
      context.fillStyle =
        settings('edgeActiveColor') === 'edge' ?
        (edge.active_color || settings('defaultEdgeActiveColor')) :
        settings('defaultEdgeLabelActiveColor');
    }
    else {
      context.fillStyle =
        (settings('edgeLabelColor') === 'edge') ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeLabelColor');
    }

    context.translate(x, y);
    context.rotate(angle);
    context.fillText(
      edge.label,
      0,
      (-size / 2) - 3
    );

    context.restore();

    function drawBackground(angle, context, fontSize, size, label, x, y) {
      var w = Math.round(
            context.measureText(label).width + size + 1.5 + fontSize / 3
          ),
          h = fontSize + 4;

      context.save();
      context.beginPath();

      // draw a rectangle for the label
      context.translate(x, y);
      context.rotate(angle);
      context.rect(-w / 2, -h -size/2, w, h);

      context.closePath();
      context.fill();
      context.restore();
    }
  };

var no_ctx_save_def = function(edge, source, target, context, settings) {
    if (typeof edge.label !== 'string' || source == target)
      return;

    var prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1;

    if (size < settings('edgeLabelThreshold') && !edge.hover)
      return;

    if (0 === settings('edgeLabelSizePowRatio'))
      throw new Error('Invalid setting: "edgeLabelSizePowRatio" is equal to 0.');

    var fontSize,
        angle = 0,
        fontStyle = edge.hover ?
          (settings('hoverFontStyle') || settings('fontStyle')) :
          settings('fontStyle'),
        x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
        y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
        dX = target[prefix + 'x'] - source[prefix + 'x'],
        dY = target[prefix + 'y'] - source[prefix + 'y'],
        sign = (source[prefix + 'x'] < target[prefix + 'x']) ? 1 : -1;

    // The font size is sublineraly proportional to the edge size, in order to
    // avoid very large labels on screen.
    // This is achieved by f(x) = x * x^(-1/ a), where 'x' is the size and 'a'
    // is the edgeLabelSizePowRatio. Notice that f(1) = 1.
    // The final form is:
    // f'(x) = b * x * x^(-1 / a), thus f'(1) = b. Application:
    // fontSize = defaultEdgeLabelSize if edgeLabelSizePowRatio = 1
    fontSize = (settings('edgeLabelSize') === 'fixed') ?
      settings('defaultEdgeLabelSize') :
      settings('defaultEdgeLabelSize') *
      size *
      Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

    if (edge.active) {
      context.font = [
        settings('activeFontStyle') || settings('fontStyle'),
        fontSize + 'px',
        settings('activeFont') || settings('font')
      ].join(' ');
    }
    else {
      context.font = [
        fontStyle,
        fontSize + 'px',
        settings('font')
      ].join(' ');
    }

    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    // force horizontal alignment if not enough space to draw the text,
    // otherwise draw text along the edge line:
    if ('auto' === settings('edgeLabelAlignment')) {
      var
        labelWidth = context.measureText(edge.label).width,
        edgeLength = sigma.utils.getDistance(
          source[prefix + 'x'],
          source[prefix + 'y'],
          target[prefix + 'x'],
          target[prefix + 'y']);

        // reduce node sizes + constant
        edgeLength = edgeLength - source[prefix + 'size'] - target[prefix + 'size'] - 10;

      if (labelWidth < edgeLength) {
        angle = Math.atan2(dY * sign, dX * sign);
      }
    }

    if (edge.hover) {
      // Label background:
      context.fillStyle = settings('edgeLabelHoverBGColor') === 'edge' ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeHoverLabelBGColor');

      if (settings('edgeLabelHoverShadow')) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 8;
        context.shadowColor = settings('edgeLabelHoverShadowColor');
      }

      drawBackground(angle, context, fontSize, size, edge.label, x, y);

      if (settings('edgeLabelHoverShadow')) {
        context.shadowBlur = 0;
        context.shadowColor = '#000';
      }
    }

    if (edge.active) {
      context.fillStyle =
        settings('edgeActiveColor') === 'edge' ?
        (edge.active_color || settings('defaultEdgeActiveColor')) :
        settings('defaultEdgeLabelActiveColor');
    }
    else {
      context.fillStyle =
        (settings('edgeLabelColor') === 'edge') ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeLabelColor');
    }

    context.translate(x,y);
    context.rotate(angle);
    context.fillText(
      edge.label,
      0,
      (-size / 2) - 3
    );
    context.rotate(-angle);
    context.translate(-x,-y);


    function drawBackground(angle, context, fontSize, size, label, x, y) {
      var w = Math.round(
            context.measureText(label).width + size + 1.5 + fontSize / 3
          ),
          h = fontSize + 4;

      context.save();
      context.beginPath();

      // draw a rectangle for the label
      context.translate(x, y);
      context.rotate(angle);
      context.rect(-w / 2, -h -size/2, w, h);

      context.closePath();
      context.fill();
      context.restore();
    }
  };

MY_PREV_FONT = "";
var ctx_font_caching = function(edge, source, target, context, settings) {
    if (typeof edge.label !== 'string' || source == target)
      return;

    var prefix = settings('prefix') || '',
        size = edge[prefix + 'size'] || 1;

    if (size < settings('edgeLabelThreshold') && !edge.hover)
      return;

    if (0 === settings('edgeLabelSizePowRatio'))
      throw new Error('Invalid setting: "edgeLabelSizePowRatio" is equal to 0.');

    var fontSize,
        angle = 0,
        fontStyle = edge.hover ?
          (settings('hoverFontStyle') || settings('fontStyle')) :
          settings('fontStyle'),
        x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
        y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
        dX = target[prefix + 'x'] - source[prefix + 'x'],
        dY = target[prefix + 'y'] - source[prefix + 'y'],
        sign = (source[prefix + 'x'] < target[prefix + 'x']) ? 1 : -1;

    // The font size is sublineraly proportional to the edge size, in order to
    // avoid very large labels on screen.
    // This is achieved by f(x) = x * x^(-1/ a), where 'x' is the size and 'a'
    // is the edgeLabelSizePowRatio. Notice that f(1) = 1.
    // The final form is:
    // f'(x) = b * x * x^(-1 / a), thus f'(1) = b. Application:
    // fontSize = defaultEdgeLabelSize if edgeLabelSizePowRatio = 1
    fontSize = (settings('edgeLabelSize') === 'fixed') ?
      settings('defaultEdgeLabelSize') :
      settings('defaultEdgeLabelSize') *
      size *
      Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

    var new_font = [
        fontStyle,
        fontSize + 'px',
        settings('font')
      ].join(' ');
    if (edge.active) {
      new_font = [
        settings('activeFontStyle') || settings('fontStyle'),
        fontSize + 'px',
        settings('activeFont') || settings('font')
      ].join(' ');
    }
    if(MY_PREV_FONT != new_font){
      context.font = new_font;
      MY_PREV_FONT = new_font;
    }

    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';

    // force horizontal alignment if not enough space to draw the text,
    // otherwise draw text along the edge line:
    if ('auto' === settings('edgeLabelAlignment')) {
      var
        labelWidth = context.measureText(edge.label).width,
        edgeLength = sigma.utils.getDistance(
          source[prefix + 'x'],
          source[prefix + 'y'],
          target[prefix + 'x'],
          target[prefix + 'y']);

        // reduce node sizes + constant
        edgeLength = edgeLength - source[prefix + 'size'] - target[prefix + 'size'] - 10;

      if (labelWidth < edgeLength) {
        angle = Math.atan2(dY * sign, dX * sign);
      }
    }

    if (edge.hover) {
      // Label background:
      context.fillStyle = settings('edgeLabelHoverBGColor') === 'edge' ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeHoverLabelBGColor');

      if (settings('edgeLabelHoverShadow')) {
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 8;
        context.shadowColor = settings('edgeLabelHoverShadowColor');
      }

      drawBackground(angle, context, fontSize, size, edge.label, x, y);

      if (settings('edgeLabelHoverShadow')) {
        context.shadowBlur = 0;
        context.shadowColor = '#000';
      }
    }

    if (edge.active) {
      context.fillStyle =
        settings('edgeActiveColor') === 'edge' ?
        (edge.active_color || settings('defaultEdgeActiveColor')) :
        settings('defaultEdgeLabelActiveColor');
    }
    else {
      context.fillStyle =
        (settings('edgeLabelColor') === 'edge') ?
        (edge.color || settings('defaultEdgeColor')) :
        settings('defaultEdgeLabelColor');
    }


    context.translate(x,y);
    context.rotate(angle);
    context.fillText(
      edge.label,
      0,
      (-size / 2) - 3
    );
    context.rotate(-angle);
    context.translate(-x,-y);

    function drawBackground(angle, context, fontSize, size, label, x, y) {
      var w = Math.round(
            context.measureText(label).width + size + 1.5 + fontSize / 3
          ),
          h = fontSize + 4;

      context.save();
      context.beginPath();

      // draw a rectangle for the label
      context.translate(x, y);
      context.rotate(angle);
      context.rect(-w / 2, -h -size/2, w, h);

      context.closePath();
      context.fill();
      context.restore();
    }
  };





























ctx_label_def = {
  render:function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        labelWidth,
        labelOffsetX,
        labelOffsetY,
        alignment = settings('labelAlignment');

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;
/*
    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');
*/
    labelWidth = context.measureText(node.label).width;
    labelOffsetX = - labelWidth / 2;
    labelOffsetY = fontSize / 3;

    switch (alignment) {
      case 'bottom':
        labelOffsetY = + size + 4 * fontSize / 3;
        break;
      case 'center':
        break;
      case 'left':
        labelOffsetX = - size - 3 - labelWidth;
        break;
      case 'top':
        labelOffsetY = - size - 2 * fontSize / 3;
        break;
      case 'inside':
        if (labelWidth <= (size + fontSize / 3) * 2) {
          break;
        }
      /* falls through*/
      case 'right':
      /* falls through*/
      default:
        labelOffsetX = size + 3;
        break;
    }

    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + labelOffsetX),
      Math.round(node[prefix + 'y'] + labelOffsetY)
    );
  }
}





















label_measure_def = {
  render:function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        labelWidth,
        labelOffsetX,
        labelOffsetY,
        alignment = settings('labelAlignment');

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    labelWidth = 0.5*node.label.length*fontSize;
    labelOffsetX = - labelWidth / 2;
    labelOffsetY = fontSize / 3;

    switch (alignment) {
      case 'bottom':
        labelOffsetY = + size + 4 * fontSize / 3;
        break;
      case 'center':
        break;
      case 'left':
        labelOffsetX = - size - 3 - labelWidth;
        break;
      case 'top':
        labelOffsetY = - size - 2 * fontSize / 3;
        break;
      case 'inside':
        if (labelWidth <= (size + fontSize / 3) * 2) {
          break;
        }
      /* falls through*/
      case 'right':
      /* falls through*/
      default:
        labelOffsetX = size + 3;
        break;
    }

    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + labelOffsetX),
      Math.round(node[prefix + 'y'] + labelOffsetY)
    );
  }
}



















label_combined_def = {
  render:function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'],
        labelWidth,
        labelOffsetX,
        labelOffsetY,
        alignment = settings('labelAlignment');

    if (size < settings('labelThreshold'))
      return;

    if (!node.label || typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;
/*
    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');
*/
    labelWidth = 0.5*node.label.length*fontSize;
    labelOffsetX = - labelWidth / 2;
    labelOffsetY = fontSize / 3;

    switch (alignment) {
      case 'bottom':
        labelOffsetY = + size + 4 * fontSize / 3;
        break;
      case 'center':
        break;
      case 'left':
        labelOffsetX = - size - 3 - labelWidth;
        break;
      case 'top':
        labelOffsetY = - size - 2 * fontSize / 3;
        break;
      case 'inside':
        if (labelWidth <= (size + fontSize / 3) * 2) {
          break;
        }
      /* falls through*/
      case 'right':
      /* falls through*/
      default:
        labelOffsetX = size + 3;
        break;
    }

    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + labelOffsetX),
      Math.round(node[prefix + 'y'] + labelOffsetY)
    );
  }
}


node_no_fill_def = function(node, context, settings) {
  var prefix = settings('prefix') || '';

  //context.fillStyle = node.color || settings('defaultNodeColor');
  context.beginPath();
  context.arc(
    node[prefix + 'x'],
    node[prefix + 'y'],
    node[prefix + 'size'],
    0,
    Math.PI * 2,
    true
  );

  context.closePath();
  context.fill();
};