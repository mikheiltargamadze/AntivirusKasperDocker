using Microsoft.Win32;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Windows;

namespace uploadFile
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }


        private void Button_Click(object sender, RoutedEventArgs e)
        {
            OpenFileDialog openFileDialog = new OpenFileDialog();

            openFileDialog.Multiselect = true;
            openFileDialog.Filter = "Text files (*.txt)|*|All files (*.*)|*.*";
            if (openFileDialog.ShowDialog() == true)
            {
                var files = new List<FileClass>();
                foreach (string filename in openFileDialog.FileNames)
                {
                    files.Add(new FileClass
                    {
                        Bytes = File.ReadAllBytes(filename),
                        FileName = filename.Substring(filename.LastIndexOf("\\") + 1)
                    });
                }
                uploadFiles(files);
            }
        }
        public void uploadFiles(List<FileClass> files)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    using (var content = new MultipartFormDataContent("upload----" + DateTime.Now.ToString(CultureInfo.InvariantCulture)))
                    {
                        files.ForEach(file =>
                        {
                            content.Add(new StreamContent(new MemoryStream(file.Bytes)), "files", file.FileName);
                        });
                        ////test hello world
                        //using (var message = client.GetAsync("http://10.100.7.4:8080/").Result)
                        //{
                        //    var json = message.Content.ReadAsStringAsync().Result;
                        //    Debug.WriteLine(json);
                        //}
                        //upload file
                        using (var message = client.PostAsync("http://10.100.7.4:8080/scan", content).Result)
                        {
                            var json = message.Content.ReadAsStringAsync().Result;
                            var result = JsonConvert.DeserializeObject<ResultAPI>(json);
                            Debug.WriteLine(json);
                        }
                    }
                }

            }
            catch (Exception ex)
            {

                throw;
            }
        }
    }

}
