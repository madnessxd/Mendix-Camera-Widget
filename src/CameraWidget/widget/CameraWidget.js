/*global logger*/
/*
    CameraWidget
    ========================

    @file      : CameraWidget.js
    @version   : 1.0.1
    @author    : Dennis Reep
    @date      : 11/8/2018
    @copyright : Incentro 2018
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "CameraWidget/lib/jquery-1.11.2",
    "dojo/text!CameraWidget/widget/template/CameraWidget.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);
	
    // Declare widget's prototype.
    return declare("CameraWidget.widget.CameraWidget", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

		cameraImage: null,
		
        // DOM elements
        inputNodes: null,
        colorSelectNode: null,
        colorInputNode: null,
        infoTextNode: null,

        // Parameters configured in the Modeler.
        mfToExecute: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _readOnly: false,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            console.log(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + ".postCreate");

            if (this.readOnly || this.get("disabled") || this.readonly) {
              this._readOnly = true;
            }
			
			var captureButton = document.getElementsByClassName("capture-button")[0];
			var screenshotButton = document.getElementsByClassName("stop-button")[0];
			var video = document.getElementsByClassName("videostream")[0];
			var canvas = document.getElementsByClassName("canvas")[0];
			canvas.style.display = 'none';
			var img = document.getElementsByClassName("img")[0];

			function handleSuccess(stream) {
				video.srcObject = stream;
			}
			function handleError(error) {
				console.error('Error: ', error);
			}

			captureButton.onclick = function() {
				video.style.display = 'block';
				img.style.display = 'none';
				const constraints = {video: true};
				navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
			}
	
			this.connect(screenshotButton, "click", function (e) {	
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				canvas.getContext('2d').drawImage(video, 0, 0);
				img.src = canvas.toDataURL('image/png');
				
				this.cameraImage = img.src.split(',')[1];
				
				video.style.display = 'none';
				img.style.display = 'block';
				var track = video.srcObject.getTracks()[0];
				track.stop();
				
				//Call microflow
				if (this.mfToExecute !== "") {
					this._contextObj.set("Base64Image", this.cameraImage);
					this._execMf(this.mfToExecute, this._contextObj.getGuid());
				}
			});
            this._updateRendering();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
          console.log(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
          console.log(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          console.log(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          console.log(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {
            console.log(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        _execMf: function (mf, guid, cb) {
            console.log(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },
		
        // Rerender the interface.
        _updateRendering: function (callback) {
            console.log(this.id + "._updateRendering");

			
			
            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            this._executeCallback(callback, "_updateRendering");
        },

        _executeCallback: function (cb, from) {
            console.log(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["CameraWidget/widget/CameraWidget"]);
