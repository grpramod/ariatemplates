/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test case for aria.touch.gestures.LongPress
 */
Aria.classDefinition({
    $classpath : 'test.aria.touch.gestures.LongPress',
    $extends : 'aria.jsunit.TemplateTestCase',
    $dependencies : ["aria.utils.Dom", "aria.utils.FireDomEvent", "aria.core.Browser", "aria.touch.Event"],
    $constructor : function () {
        this.$TemplateTestCase.constructor.call(this);
        this.setTestEnv({
            template : 'test.aria.touch.gestures.LongPressTpl'
        });
        this.domUtil = aria.utils.Dom;
        this.fireEvent = aria.utils.FireDomEvent;
        this.target = {};
        this.touchEventMap = aria.touch.Event.touchEventMap;
    },
    $destructor : function () {
        this.domUtil = null;
        this.fireEvent = null;
        this.target = null;
        this.touchEventMap = null;
        this.$TemplateTestCase.$destructor.call(this);
    },
    $prototype : {
        /**
         * Start the template test suite for the LongPress event.
         */
        runTemplateTest : function () {
            this.target = this.domUtil.getElementById("touchboard");
            this._testCancelMultiLongPress();
        },
        /**
         * Test a cancel long press: touchstart, touchmove with 2 fingers
         */
        _testCancelMultiLongPress : function () {
            var args = {
                    "sequence" : ["longpressstart","longpresscancel"],
                    "callback" : this._testCancelMoveLongPress
            };
            this._raiseFakeEvent(this.touchEventMap.touchstart, {isPrimary: true, touches: [{clientX: 0, clientY: 0}], changedTouches: [{clientX: 0, clientY: 0}]});
            this._raiseFakeEvent(this.touchEventMap.touchmove, {isPrimary: false, touches: [{clientX: 0, clientY: 0}, {clientX: 5, clientY: 5}], changedTouches: [{clientX: 5, clientY: 5}]});
            this._delay(10, this._testEvents, args);
        },
        /**
         * Test a cancel long press: touchstart, touchmove with distance > 10.
         */
        _testCancelMoveLongPress : function () {
            var args = {
                    "sequence" : ["longpressstart","longpresscancel"],
                    "callback" : this._testCancelTapLongPress
            };
            this._raiseFakeEvent(this.touchEventMap.touchstart, {clientX: 0, clientY: 0});
            this._raiseFakeEvent(this.touchEventMap.touchmove, {clientX: 100, clientY: 100});
            this._delay(10, this._testEvents, args);
        },
        /**
         * Test a not completed long press: touchstart, touchmove with distance <= 10, touchend within 2000ms.
         */
        _testCancelTapLongPress : function () {
            var args = {
                    "sequence" : ["longpressstart","longpresscancel"],
                    "callback" : this._testTrueLongPress
            };
            this._raiseFakeEvent(this.touchEventMap.touchstart, {clientX: 0, clientY: 0});
            this._raiseFakeEvent(this.touchEventMap.touchmove, {clientX: 5, clientY: 5});
            this._raiseFakeEvent(this.touchEventMap.touchend, {clientX: 5, clientY: 5});
            this._delay(10, this._testEvents, args);
        },
        /**
         * Test a valid long press: touchstart, touchmove with distance <= 10, wait 2100 ms.
         */
        _testTrueLongPress : function () {
            var args = {
                    "sequence" : ["longpressstart","longpress"],
                    "callback" : this._endTests
            };
            this._raiseFakeEvent(this.touchEventMap.touchstart, {clientX: 0, clientY: 0});
            this._raiseFakeEvent(this.touchEventMap.touchmove, {clientX: 5, clientY: 5});
            this._delay(1500, this._testEventsFinal, args);
        },
        /**
         * Finalize the long press gesture.
         * @param {Object} args
         */
        _testEventsFinal : function(args) {
            this._delay(10, this._testEvents, args);
        },
        /**
         * Utility to raise fake events.
         * @param {String} eventName
         */
        _raiseFakeEvent : function (eventName, options) {
            this.fireEvent.fireEvent(eventName, this.target, options);
        },
        /**
         * Utility to add delay.
         * @param {Number} delay
         * @param {Object} callback
         * @param {Object} args
         */
        _delay : function (delay, callback, args) {
            var callback = (callback) ? callback : args.callback;
            aria.core.Timer.addCallback({
                fn : callback,
                scope : this,
                delay : delay,
                args : args
            });
        },
        /**
         * Utility to test a sequence of events.
         * @param {Object} args
         */
        _testEvents : function (args) {
            var isSameLength = args.sequence.length == this.templateCtxt.data.events.length;
            this.assertTrue(isSameLength);
            if (isSameLength) {
                for (var i = 0; i < args.sequence.length; i++) {
                    this.assertTrue(args.sequence[i] === this.templateCtxt.data.events[i]);
                }
            }
            this._delay(args.addDelay || 10, null, args);
        },
        /**
         * Wrapper to end the tests.
         */
        _endTests : function () {
            this._raiseFakeEvent(this.touchEventMap.touchend, {clientX: 5, clientY: 5});
            this._delay(1000, this.end, {});
        }
    }
});
