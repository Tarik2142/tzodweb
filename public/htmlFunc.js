$(document).ready(function () {
  document.oncontextmenu = function (e) {
    e.preventDefault();
  };
  openForm();
});

function openForm() {
  $("#modal").css('display', 'block');
}

function closeForm() {
  $("#modal").css('display', 'none');
}

function setNickname() {
  var text = $('#nickName').val();
  if (!text || text === '') {
    alert('Enter username first!');
    $('#nickName').css('border', '2px solid red');
    setTimeout(function () {
      $('#nickName').css('border', 'none');
    }, 5000);
    return false;
  }
  playerName = text;
  return true;
}

function insertBr(elem) {
  $('<br>').appendTo($(elem));
}

function serverCfg() {
  if (!setNickname()) return;
  $('#modalContent').html('<br>');
  $('<label>', {
    for: 'mapSelector',
    id: 'mapSelectorLabel',
    text: 'Choose a map: '
  }).appendTo($('#modalContent'));

  $('<select>', {
    id: 'mapSelector',
    name: 'mapSelector',
  }).appendTo($('#modalContent'));
  
  for (var maps = 0; maps < mapList.length; maps++){//подстановка карт в вибор карт
    $('<option>', {
      value: mapList[maps].file,
      text: mapList[maps].desc
    }).appendTo($('#mapSelector'));
  }

  insertBr('#modalContent');

  $('<label>', {
    for: 'serverType',
    id: 'serverTypeLabel',
    text: 'Private server? '
  }).appendTo($('#modalContent'));
  $('<input>', {
    type: 'checkbox',
    name: 'serverType',
    id: 'serverType',
    click: function () {
      if (this.checked) {
        $('#password').css('display', 'inline');
        $('#passwordLabel').css('display', 'inline');
      } else {
        $('#password').css('display', 'none');
        $('#passwordLabel').css('display', 'none');
      }
    }
  }).appendTo($('#modalContent'));

  insertBr('#modalContent');

  $('<label>', {
    for: 'password',
    id: 'passwordLabel',
    text: 'Enter password: ',
    css: {
      display: 'none'
    }
  }).appendTo($('#modalContent'));
  $('<input>', {
    type: 'text',
    id: 'password',
    name: 'password',
    css: {
      display: 'none'
    }
  }).appendTo($('#modalContent'));

  insertBr('#modalContent');
  insertBr('#modalContent');

  $('<button>', {
    class: 'btn',
    text: 'Start server',
    click: function () {
      startServer();
    }
  }).appendTo($('#modalContent'));
  insertBr('#modalContent');
  insertBr('#modalContent');
}

function connectCfg() {
  socket.emit('listRooms');
  socket.on('roomList', function(data){
    logObj('rooms:', data);
  });
  if (!setNickname()) return;
//   $('#modalContent').html('<br>');
//   $('<label>', {
//     for: 'roomId',
//     id: 'roomIdLabel',
//     text: 'Enter room id: '
//   }).appendTo($('#modalContent'));
//   $('<input>', {
//     type: 'text',
//     id: 'roomId',
//     name: 'roomId',
//   }).appendTo($('#modalContent'));

//   insertBr('#modalContent');
  
//   //$('#modalContent').html('<br>');
//   $('<label>', {
//     for: 'roomPassword',
//     id: 'roomPasswordLabel',
//     text: 'Enter room password (for private room): '
//   }).appendTo($('#modalContent'));
//   $('<input>', {
//     type: 'text',
//     id: 'roomPassword',
//     name: 'roomPassword',
//   }).appendTo($('#modalContent'));
  
//   insertBr('#modalContent');
  
//   $('<button>', {
//     class: 'btn',
//     text: 'Connect',
//     click: function () {
//       socket.emit('join', {
//         name: playerName,
//         room: $('#roomId').val(),
//         password: $('#roomPassword').val()
//   });
//     }
//   }).appendTo($('#modalContent'));
  
  
  
  
  insertBr('#modalContent');
  insertBr('#modalContent');
  socket.on('joinResult', function(data){
    if (data.result){
      map = data.map;
      startClient();
    }else{
      alert(data.text);
    }
  });
}