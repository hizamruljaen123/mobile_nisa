$(document).ready(function() {

    // Fungsi untuk menangani perubahan pada input file
    $('#fileUpload').change(function() {
        var fileName = $(this).val().split('\\').pop(); // Ambil nama file dari path lengkapnya
        $('.custom-file-upload span').text(fileName); // Tampilkan nama file di dalam label tombol upload
    });

    // Fungsi untuk menangani klik tombol upload
    $('#uploadButton').click(function() {
        var formData = new FormData();
        var file = $('#fileUpload')[0].files[0];
        formData.append('file', file);

        // Tampilkan nama file di dalam label tombol upload
        var fileName = file.name;
        $('.custom-file-upload span').text(fileName);

        // Sembunyikan form upload dan tampilkan progress bar serta pesan status
        $('.card-body').hide();
        $('#progressBar').show();
        $('#statusMessage').show();

        // Ajax request untuk meng-handle upload file dan analisis
        $.ajax({
            type: 'POST',
            url: 'http://localhost:5000/upload_detect_visualize', // Ganti URL ini sesuai dengan endpoint API Anda
            data: formData,
            contentType: false,
            processData: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                // Upload progress
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total * 100;
                        $('#progressBar .progress-bar').css('width', percentComplete + '%');
                        $('#progressBar .progress-bar').attr('aria-valuenow', percentComplete);
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                // Mengubah style display menjadi none untuk progress bar dan pesan status
                $('#card-display').css('display', 'none');
                $('#progressBar').css('display', 'none');
                $('#statusMessage').css('display', 'none');

                // Tampilkan container hasil
                $('.result-container').fadeIn();

                // Tampilkan hasil dalam format tabel
                var tableHtml = '<table class="table"><thead><tr><th>Tajweed</th><th>Similarity (%)</th></tr></thead><tbody>';
                response.segment_results.forEach(function(result) {
                    var formattedTajweed = formatText(result[1]);
                    tableHtml += '<tr><td>' + formattedTajweed + '</td><td width="35%" style="text-align:right;">' + result[2].toFixed(2) + '</td></tr>';
                });
                tableHtml += '</tbody></table>';
                $('#resultTable').html(tableHtml);

                // Tampilkan gambar plot
                var imageUrl = response.plot_urls[0]; // Anggapannya hanya satu URL plot yang dikembalikan
                var imageHtml = '<img src="' + imageUrl + '" class="img-fluid" alt="Detection Plot">';
                $('#resultImage').html(imageHtml);

                // Tampilkan pemutar audio
                var audioUrl = '' + response.audio_file;
                $('#audio').attr('src', audioUrl);
            },
            error: function(error) {
                console.error('Error uploading file:', error);
                $('#progressBar').hide(); // Sembunyikan progress bar jika terjadi error
                $('#statusMessage').hide(); // Sembunyikan pesan status jika terjadi error
                $('.card-body').show(); // Tampilkan kembali form upload jika terjadi error
            }
        });
    });

    // Fungsi untuk memformat teks
    function formatText(text) {
        return text
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Kontrol pemutar audio
    var audio = document.getElementById('audio');
    var playPauseBtn = document.getElementById('playPauseBtn');
    var stopBtn = document.getElementById('stopBtn');

    playPauseBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            audio.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    stopBtn.addEventListener('click', function() {
        audio.pause();
        audio.currentTime = 0;
        playPauseBtn.textContent = 'Play';
    });

    audio.addEventListener('ended', function() {
        playPauseBtn.textContent = 'Play';
    });

});
