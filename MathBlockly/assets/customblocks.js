document.addEventListener("DOMContentLoaded", function () {
    var text = document.getElementsByClassName('question');

    var answers = document.getElementsByClassName('answer');

    // Define the custom block
    Blockly.Blocks['block'] = {
        init: function () {
            this.appendDummyInput()
                .appendField("Hình vuông");
            this.appendValueInput("NAME")
                .setCheck(null)
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField("Hình ảnh:");
            this.setColour(180);
            this.setTooltip("");
            this.setHelpUrl("");
        }
    };
    var tmp = "";
    for (var i = 0; i < answers.length; i++) {
        (function(index) {
            var path = answers[index].textContent;
            var nameBlock = "image" + index;

            Blockly.Blocks[nameBlock] = {
                init: function () {
                    this.appendDummyInput('dummyImage')
                        .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
                    this.setOutput(true, null);
                    this.setColour(165);
                    this.setTooltip("");
                    this.setHelpUrl("");
                }
            };

            if (index === answers.length - 1) {
                tmp += '<block type="' + nameBlock + '"></block>';
            } else {
                tmp += '<block type="' + nameBlock + '"></block>, ';
            }
        })(i);
    }

    var workspace = Blockly.inject('blocklyDiv', {
        toolbox: '<xml>' + tmp + '</xml>',
        trashcan: true
    });


    let workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
    let x = workspaceCoordinates.left + (workspaceCoordinates.width / 6)
    let y = workspaceCoordinates.top + (workspaceCoordinates.height / 6)
    let blockCoordinates = new Blockly.utils.Coordinate(x, y)

    var newBlock = workspace.newBlock('block');
    newBlock.initSvg();
    newBlock.render();
    newBlock.moveTo(blockCoordinates)

    // Define the custom block's JavaScript code generation
    Blockly.JavaScript['block'] = function (block) {
        var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
        var code = 'Hello ' + value_name + '\n';
        return code;
    };
});