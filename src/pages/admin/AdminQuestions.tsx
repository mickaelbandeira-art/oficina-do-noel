import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { generateQuizQuestions } from "@/services/groqService";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  order_index: number;
  is_active: boolean;
}

const emptyQuestion = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  order_index: 0,
  is_active: true,
};

const AdminQuestions = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState(emptyQuestion);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("christmas_questions")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
        order_index: question.order_index,
        is_active: question.is_active,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        ...emptyQuestion,
        order_index: questions.length + 1,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from("christmas_questions")
          .update(formData)
          .eq("id", editingQuestion.id);

        if (error) throw error;
        toast({ title: "Pergunta atualizada!" });
      } else {
        const { error } = await supabase
          .from("christmas_questions")
          .insert(formData);

        if (error) throw error;
        toast({ title: "Pergunta criada!" });
      }

      setDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar pergunta",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pergunta?")) return;

    try {
      const { error } = await supabase
        .from("christmas_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Pergunta excluída!" });
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (question: Question) => {
    try {
      const { error } = await supabase
        .from("christmas_questions")
        .update({ is_active: !question.is_active })
        .eq("id", question.id);

      if (error) throw error;
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAI = async () => {
    try {
      setGeneratingAI(true);
      toast({ title: "Gerando perguntas com IA...", description: "Isso pode levar alguns segundos" });

      const generated = await generateQuizQuestions();
      setAiQuestions(generated);
      setAiPreviewOpen(true);

      toast({
        title: "Perguntas geradas!",
        description: `${generated.length} perguntas criadas com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar perguntas com IA",
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveAIQuestions = async () => {
    try {
      // Desativar todas as perguntas existentes
      await supabase
        .from("christmas_questions")
        .update({ is_active: false })
        .eq("is_active", true);

      // Inserir novas perguntas
      const questionsToInsert = aiQuestions.map((q, idx) => ({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        order_index: idx + 1,
        is_active: true,
      }));

      const { error } = await supabase
        .from("christmas_questions")
        .insert(questionsToInsert);

      if (error) throw error;

      toast({
        title: "Perguntas salvas!",
        description: "As perguntas geradas por IA foram salvas no banco de dados"
      });

      setAiPreviewOpen(false);
      fetchQuestions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar perguntas",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Perguntas do Quiz</h2>
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateAI}
            disabled={generatingAI}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {generatingAI ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar com IA
              </>
            )}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-christmas-red hover:bg-christmas-red/90">
                <Plus className="mr-2 h-4 w-4" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? "Editar Pergunta" : "Nova Pergunta"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Pergunta</Label>
                  <Textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Digite a pergunta..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Opção A</Label>
                    <Input
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opção B</Label>
                    <Input
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opção C</Label>
                    <Input
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opção D</Label>
                    <Input
                      value={formData.option_d}
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resposta Correta</Label>
                    <Select
                      value={formData.correct_answer}
                      onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Opção A</SelectItem>
                        <SelectItem value="B">Opção B</SelectItem>
                        <SelectItem value="C">Opção C</SelectItem>
                        <SelectItem value="D">Opção D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Pergunta ativa</Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="bg-christmas-green hover:bg-christmas-green/90">
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Preview Dialog */}
      <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Perguntas Geradas por IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              {aiQuestions.length} perguntas foram geradas. Revise e salve no banco de dados.
            </p>
            {aiQuestions.map((q, idx) => (
              <div key={idx} className="bg-card rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                    #{idx + 1}
                  </span>
                </div>
                <p className="font-medium text-foreground mb-2">{q.question}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span className={q.correct_answer === "A" ? "text-green-600 font-medium" : ""}>
                    A) {q.option_a}
                  </span>
                  <span className={q.correct_answer === "B" ? "text-green-600 font-medium" : ""}>
                    B) {q.option_b}
                  </span>
                  <span className={q.correct_answer === "C" ? "text-green-600 font-medium" : ""}>
                    C) {q.option_c}
                  </span>
                  <span className={q.correct_answer === "D" ? "text-green-600 font-medium" : ""}>
                    D) {q.option_d}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setAiPreviewOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAIQuestions}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Salvar no Banco de Dados
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : questions.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma pergunta cadastrada</p>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              className="bg-card rounded-xl border p-4 flex items-start gap-4"
            >
              <div className="text-muted-foreground pt-1">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-christmas-red/10 text-christmas-red text-xs font-medium px-2 py-1 rounded">
                    #{question.order_index}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${question.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {question.is_active ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <p className="font-medium text-foreground mb-2">{question.question}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span className={question.correct_answer === "A" ? "text-green-600 font-medium" : ""}>
                    A) {question.option_a}
                  </span>
                  <span className={question.correct_answer === "B" ? "text-green-600 font-medium" : ""}>
                    B) {question.option_b}
                  </span>
                  <span className={question.correct_answer === "C" ? "text-green-600 font-medium" : ""}>
                    C) {question.option_c}
                  </span>
                  <span className={question.correct_answer === "D" ? "text-green-600 font-medium" : ""}>
                    D) {question.option_d}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(question)}
                >
                  <Switch checked={question.is_active} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(question)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(question.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;