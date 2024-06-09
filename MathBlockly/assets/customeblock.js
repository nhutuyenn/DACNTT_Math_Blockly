document.addEventListener("DOMContentLoaded", function () {
    loadCustomblocks();
});

function loadCustomblocks() {
    var question = JSON.parse(document.getElementById('temp').getAttribute('data-questions'));
    const answers = JSON.parse(document.getElementById('answers').getAttribute('data-answers'));

    var tmp = "";
    for (var i = 0; i < answers.length; i++) {
        (function (index) {
            var path = answers[index].answer;
            var nameBlock = answers[index]._id;

            if (answers[index].connection === "topBottom") {
                Blockly.Blocks[nameBlock] = {
                    init: function () {
                        this.appendValueInput("NAME")
                            .setCheck(null)
                            .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
                        this.setPreviousStatement(true, null);
                        this.setNextStatement(true, null);
                        this.setColour(180);
                        this.setTooltip("");
                        this.setHelpUrl("");
                    }
                };
            }
            else if (answers[index].connection === "leftRight") {
                Blockly.Blocks[nameBlock] = {
                    init: function () {
                        this.appendValueInput("NAME")
                            .setCheck(null)
                            .appendField(new Blockly.FieldImage(path, 80, 80, { alt: "*", flipRtl: "FALSE" }));
                        this.setOutput(true, null);
                        this.setColour(230);
                        this.setTooltip("");
                        this.setHelpUrl("");
                    }
                };
            }
            else {
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
            }

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

    if (question[0].question.length > 0) {
        Blockly.Blocks['block'] = {
            init: function () {
                this.appendDummyInput("dummy_input")
                    .appendField(question[0].question);
                this.appendValueInput("NAME")
                    .setCheck(null)
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .appendField("Hình ảnh:");
                this.setColour(180);
                this.setTooltip("");
                this.setHelpUrl("");
            }
        };


        let workspaceCoordinates = workspace.getMetricsManager().getViewMetrics(true)
        let x = workspaceCoordinates.left + (workspaceCoordinates.width / 6)
        let y = workspaceCoordinates.top + (workspaceCoordinates.height / 6)
        let blockCoordinates = new Blockly.utils.Coordinate(x, y)

        var newBlock = workspace.newBlock('block');
        newBlock.initSvg();
        newBlock.render();
        newBlock.moveTo(blockCoordinates)
    }

    // Define the custom block's JavaScript code generation
    Blockly.JavaScript['block'] = function (block) {
        var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
        var code = 'Hello ' + value_name + '\n';
        return code;
    };
}
