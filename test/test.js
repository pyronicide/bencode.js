
var benc = require('../bencode.js'),
    hexy = require('hexy')


function log(msg) {
  console.log(msg)
  process.stdout.flush()
}

function assert(msg, should, is) {
  if (! (should === is) ) {
    log(msg+" failed: should be: >"+should+"< is >"+ is + "<");
    return false
  }
  return true
}

function assert_obj(msg, should, is) {

  if (! (JSON.stringify(should) === JSON.stringify(is)) ) {
    log(msg+" failed: should be: >"+should+"< is >"+ is + "<");
    return false
  }
  return true
}

function assert_buf(msg, should, is) {
  if (typeof(should) === "string" && is instanceof Buffer) {
    assert(msg, should, is.toString())
  } else {
    assert(msg, should, is)
  }
}

/**********************************************************************
*  Encoding tests.
***********************************************************************/

function docs () {
  var exmp = {}

  exmp.bla = "blup"
  exmp.foo = "bar"
  exmp.one = 1
  exmp.woah = {}
  exmp.woah.arr = []
  exmp.woah.arr.push(1)
  exmp.woah.arr.push(2)
  exmp.woah.arr.push(3)
  exmp.str = new Buffer("Buffers work too")

  var bencBuffer = benc.encode(exmp)
  
  return assert("src comment doc example", 
                "d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arrli1ei2ei3eee3:str16:Buffers work tooe",
                bencBuffer.toString())
}

function str_e () {
  var ret = true
  ret &= assert('str1', '4:1234', benc.encode('1234').toString() )
  ret &= assert('str2', '8:unicöde', benc.encode('unicöde').toString() )
  ret &= assert('str3', '0:', benc.encode('').toString() ) // empty strings? not sure here

  //log("assert('str1', '"+benc.encode('').toString()+"', benc.encode('').toString() )")
  //log("assert('str2', '"+benc.encode('unicöde').toString()+"', benc.encode('unicöde') )")
//  log("assert('str1', "+benc.encode('1234').toString()+", benc.encode('1234') )")
//  log(Bencode(1234).toString())
//  log(Bencode(-1234).toString())
//  log(Bencode([1,2,3,4]).toString())
//  log(Bencode({1:2, 3:4}).toString())
  return ret 
}

function num_e() {
  var ret=true
  assert('num1', 'i1234e', benc.encode(1234).toString() )
  assert('num2', 'i-1234e', benc.encode(-1234).toString() )
  assert('num3', 'i0e', benc.encode(0).toString() )
    
//  log("assert('num1', '"+benc.encode(1234).toString()+"', benc.encode(1234) )")
//  log("assert('num2', '"+benc.encode(-1234).toString()+"', benc.encode(-1234) )")
//  log("assert('num3', '"+benc.encode(0).toString()+"', benc.encode(-1234) )")
}

function list_e() {
  assert('list1', 'le', benc.encode([]).toString() )
  assert('list2', 'li1ee', benc.encode([1]).toString() )
  assert('list3', 'li1ei2ei3e4:foure', benc.encode([1,2,3,'four']).toString() )
  
  //log("assert('list1', '"+benc.encode([]).toString()+"', benc.encode([]).toString() )")
  //log("assert('list2', '"+benc.encode([1]).toString()+"', benc.encode([1]).toString() )")
  //log("assert('list3', '"+benc.encode([1,2,3,"four"]).toString()+"', benc.encode([1,2,3,'four']).toString() )")
 
}
function dict_e() {
  assert('dict1', 'de', benc.encode({}).toString() )
  assert('dict2', 'd3:bla4:blube', benc.encode({'bla':'blub'}).toString() )
  assert('dict3', 'd3:bla4:blub4:blubi4ee', benc.encode({'bla':'blub', 'blub':4}).toString() )

  //log("assert('dict1', '"+benc.encode({}).toString()+"', benc.encode({}).toString() )")
  //log("assert('dict2', '"+benc.encode({"bla":"blub"}).toString()+"', benc.encode({'bla':'blub'}).toString() )")
  //log("assert('dict3', '"+benc.encode({"bla":"blub", "blub":4}).toString()+"', benc.encode({'bla':'blub', 'blub':4}).toString() )")
 
}


/**********************************************************************
*  Decoding tests.
***********************************************************************/

function docs_d () {
  var exmp  = {},
      exmp2 = benc.decode(new Buffer("d3:bla4:blup3:foo3:bar3:onei1e4:woahd3:arrli1ei2ei3eee3:str16:Buffers work tooe"))

  exmp.bla = "blup"
  exmp.foo = "bar"
  exmp.one = 1
  exmp.woah = {}
  exmp.woah.arr = []
  exmp.woah.arr.push(1)
  exmp.woah.arr.push(2)
  exmp.woah.arr.push(3)
  exmp.str = "Buffers work too" // ha, but no decoding!

  
  for (var p in exmp) {
    if ( "woah" === p ) {
      var arr  = exmp.woah.arr,
          arr2 = exmp2.woah.arr

      assert("nested arr len", arr.length, arr2.length)
      for (var j in arr) {
        assert("nested arr len", arr[j], arr2[j])
        
      }
      continue
    }
    assert_buf("doc example (decode) : "+p, exmp[p], exmp2[p])
  }

}

function str_d () {
  var ret = true
  ret &= assert('str_d1', '1234',    benc.decode(new Buffer('4:1234')).toString() )
  ret &= assert('str_d2', 'unicöde', benc.decode(new Buffer('8:unicöde')).toString() )
  ret &= assert('str_d3', '',        benc.decode(new Buffer('0:')).toString() )

  ret &= assert('str_d4', '1234',    benc.decode('4:1234').toString() )
  ret &= assert('str_d5', 'unicöde', benc.decode('8:unicöde').toString() )
  ret &= assert('str_d6', '',        benc.decode('0:').toString() )
  return ret 
}

function num_d() {
  var ret=true
  assert('num_d1',  1234,  benc.decode(new Buffer('i1234e')) )
  assert('num_d2', -1234,  benc.decode(new Buffer('i-1234e')) )
  assert('num_d3',     0,  benc.decode(new Buffer('i0e')) )

  assert('num_d4',  1234,  benc.decode('i1234e') )
  assert('num_d5', -1234,  benc.decode('i-1234e') )
  assert('num_d6',     0,  benc.decode('i0e') )


  var caught = false
  try {
    benc.decode(new Buffer('i1-1e')) 
  } catch (e) {
    assert("illegal num", 'not part of int at:2', e.message)
    caught = true
  }
  assert ("exception not raised", true, caught)
    
}

function list_d() {
  assert_obj('list_d1', [], benc.decode(new Buffer("le")) )
  assert_obj('list_d2', [1], benc.decode(new Buffer('li1ee')) )
  assert_obj('list_d3', [1,2,3,new Buffer('four')], benc.decode(new Buffer("li1ei2ei3e4:foure")) )
  
 
  assert_obj('list_d4', [], benc.decode("le") )
  assert_obj('list_d5', [1], benc.decode('li1ee') )
  assert_obj('list_d6', [1,2,3,new Buffer('four')], benc.decode("li1ei2ei3e4:foure") )
}
function dict_d() {
  assert_obj('dict_d1', {},             benc.decode(new Buffer("de")) )
  assert_obj('dict_d2', {"bla":new Buffer('blub')}, 
                                        benc.decode(new Buffer("d3:bla4:blube")) )
  assert_obj('dict_d3', {"bla": new Buffer('blub'), "blub":4}, 
                                        benc.decode(new Buffer("d3:bla4:blub4:blubi4ee")) )


  assert_obj('dict_d4', {},             benc.decode("de") )
  assert_obj('dict_d5', {"bla":new Buffer('blub')}, 
                                        benc.decode("d3:bla4:blube") )
  assert_obj('dict_d6', {"bla": new Buffer('blub'), "blub":4}, 
                                        benc.decode("d3:bla4:blub4:blubi4ee") )
 
}



docs()
str_e()
num_e()
list_e()
dict_e()
docs_d()
str_d()
num_d()
list_d()


