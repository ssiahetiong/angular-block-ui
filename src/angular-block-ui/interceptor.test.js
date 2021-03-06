describe('block-ui-http-interceptor', function() {

  var blockUI, interceptor, blockUIConfig;

  beforeEach(function() {
    
    module('blockUI');

    inject(function(_blockUI_, _blockUIHttpInterceptor_, _blockUIConfig_) {
      blockUI = _blockUI_;
      interceptor = _blockUIHttpInterceptor_;
      blockUIConfig = _blockUIConfig_;
    });

  });

  describe('request', function() {

    it('should start the main block', function() {

      interceptor.request({ url: '/api/quote/1' });
      
      expect(blockUI.state().blockCount).toBe(1);

    });

    it('should not autoblock requests', function() {

      blockUIConfig.autoBlock = false;

      interceptor.request({ url: '/api/quote/1' });
      
      expect(blockUI.state().blockCount).toBe(0);
      
    });

    it('should not block filtered requests', function() {

      blockUIConfig.requestFilter = function(config) {
        return false;
      }

      interceptor.request({ url: '/api/quote/1' });
      
      expect(blockUI.state().blockCount).toBe(0);

    });

    it('should block instances that match the pattern', function() {

      var myInstance1 = blockUI.instances.get('myInstance1');
      var myInstance2 = blockUI.instances.get('myInstance2');

      myInstance1.pattern(/^\/api\/quote\/\d+$/);
      myInstance2.pattern(/^\/api\/quote/);

      interceptor.request({ url: '/api/quote/1' });

      expect(blockUI.state().blockCount).toBe(0);
      expect(myInstance1.state().blockCount).toBe(1);
      expect(myInstance2.state().blockCount).toBe(1);
    });

    it('should not block instances that do not match the pattern', function() {

      var myInstance1 = blockUI.instances.get('myInstance1');
      var myInstance2 = blockUI.instances.get('myInstance2');

      myInstance1.pattern(/^\/api\/quote\/\d+$/);
      myInstance2.pattern(/^\/api\/quote/);

      interceptor.request({ url: '/api/user/1' });

      expect(blockUI.state().blockCount).toBe(1);
      expect(myInstance1.state().blockCount).toBe(0);
      expect(myInstance2.state().blockCount).toBe(0);
    });

  });

  describe('response', function() {

    it('should stop the main block', function() {

      var blocks = blockUI.instances.locate({ url: '/api/quote/123' });

      blockUI.start(); // set blockcount to 1

      interceptor.response({ config: { $_blocks: blocks }});

      expect(blockUI.state().blockCount).toBe(0);

    });

    it('should not stop the main block when autoBlock is false', function() {

      var blocks = blockUI.instances.locate({ url: '/api/quote/123' });

      blockUIConfig.autoBlock = false;

      blockUI.start(); // set blockcount to 1

      interceptor.response({ config: { $_blocks: blocks }});

      expect(blockUI.state().blockCount).toBe(1);
      
    });

    it('should not stop blocks that are filtered', function() {

      var blocks = blockUI.instances.locate({ url: '/api/quote/123' });

      blockUI.start(); // set blockcount to 1

      interceptor.response({ config: { $_noBlock: true, $_blocks: blocks }});

      expect(blockUI.state().blockCount).toBe(1);
      
    });

    it('should stop $_blocks that matched the pattern', function() {

      var myInstance1 = blockUI.instances.get('myInstance1');
      var myInstance2 = blockUI.instances.get('myInstance2');
      
      myInstance1.pattern(/^\/api\/quote\/\d+$/);
      myInstance2.pattern(/^\/api\/quote/);

      blockUI.start(); // set blockcount to 1
      myInstance1.start(); // set blockcount to 1
      myInstance2.start(); // set blockcount to 1

      var blocks = blockUI.instances.locate({ url: '/api/quote/123' });

      interceptor.response({ config: { $_blocks: blocks }});

      expect(blockUI.state().blockCount).toBe(1);
      expect(myInstance1.state().blockCount).toBe(0);
      expect(myInstance2.state().blockCount).toBe(0);

    });
  });
});